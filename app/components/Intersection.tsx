"use client"

import { useState, useEffect } from 'react'
import Clock from '../domain/Clock'
import TrafficLight from '../domain/TrafficLight'
import LightConfig, { LightSettings, DEFAULT_LIGHT_SETTINGS } from '../domain/LightConfig'
import Failure from '../domain/Failure'
import { Fab, Stack, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { LightSettingsParser, IntersectionSettingsParser } from '../url'
import IntersectionSettings, { DEFAULT_INTERSECTION_SETTINGS } from '../domain/IntersectionSettings'
import Fullscreen from './Fullscreen'
import LightHead from './LightHead'
import React from 'react'
import ShareDialog from './ShareDialog'
import timeSync from '../domain/timeSync'
import LightDetails from './LightDetails'
import LightUiState from '../domain/LightUiState'
import { createParser, Options, parseAsArrayOf, parseAsInteger, useQueryState } from 'nuqs'
import IntersectionSettingsPanel from './IntersectionSettingsPanel'
import LightGroup, { LightRecord } from './LightGroup'

export type UiMode = 'none' | 'share' | 'fullscreen'
export type SelectionMode = 'none' | 'some' | 'all' | 'set-all' | 'set-none'

const historyPush: Options = { history: 'push' }

// TODOs
// Offline usage
// Manual time correction in cookie / local storage
// blink & beep
// fix the timeline range slider on edge (when expanding)
// breadcrumbs

export default function IntersectionComponent({ 
  uiMode, 
  setUiMode, 
}: { 
  uiMode: UiMode,
  setUiMode: (uiMode: UiMode) => void, 
}) {

  const [intersectionSettings, setIntersectionSettings] = useQueryState(
    "intersection", 
    createParser(IntersectionSettingsParser).withDefault(DEFAULT_INTERSECTION_SETTINGS)
  )

  const [lightSettings, setLightSettings] = useQueryState(
    "lights", 
    createParser(LightSettingsParser).withDefault([DEFAULT_LIGHT_SETTINGS])
  )

  const [groups, setGroups] = useQueryState<number[]>(
    "groups", 
    parseAsArrayOf(parseAsInteger).withDefault(lightSettings.map((_, index) => index))
  )

  const [expanded, setExpanded] = useQueryState("e", parseAsInteger.withOptions(historyPush))

  const [timeCorrection, setTimeCorrection] = useState(0)

  const [currentTimestamp, setCurrentTimestamp] = useState(Date.now())

  const [selected, setSelected] = useState<number[]>([])

  const effectivelySelected = selected.length == 0 ? lightSettings.map((ls, index) => index) : selected

  const grouping = Object.values(Object.groupBy(groups.map((_, idx) => idx), (_, lightIdx) => groups[lightIdx])) as number[][]

  const [groupUiStates, setGroupUiStates] = useState(grouping.map((lightIndices) => new LightUiState(lightSettings[lightIndices[0]].phases[0].state)))

  const failure = new Failure(intersectionSettings.failure.duration, intersectionSettings.failure.probability)

  const hasFailed = failure.currentState(currentTimestamp)

  const lightConfigs = lightSettings.map(lightSetting => new LightConfig(intersectionSettings, lightSetting))

  const lights = lightConfigs.map(lightConfig => new TrafficLight(lightConfig, hasFailed))

  const lightRecords: LightRecord[] = lightConfigs.map((_, index) => ({ 
    light: lights[index],
    lightConfig: lightConfigs[index],
    onLightSettingsChange: (settings: LightSettings) => updateLightSettings(settings, index),
    setExpanded: () => setExpanded(index)
  }))

  const clock = new Clock(timeCorrection)
  
  const updateLightSettings = (settings: LightSettings, index: number) => {
    const copy = [...lightSettings]
    copy.splice(index, 1, settings)
    setLightSettings(copy)
    setCurrentTimestamp(clock.now())
  }

  const updateGroupUiState = (lightUiState: LightUiState, groupIdx: number) => {
    const copy = [...groupUiStates]
    copy.splice(groupIdx, 1, lightUiState)
    setGroupUiStates(copy)
  }

  const wrapListener = {
    nextStateTimestamp: (timestamp: number) => (Math.floor(timestamp / intersectionSettings.cycleLength) + 1) * intersectionSettings.cycleLength
  }

  const enterUiMode = (idx: number[], uiMode: UiMode) => {
    setSelected(idx)
    setUiMode(uiMode)
  }

  const exitUiMode = () => {
    setUiMode('none')
    setSelected([])
  }

  const enterFullscreenMode = (idx: number[]) => {
    enterUiMode(idx, 'fullscreen')
  }

  const enterShareMode = (idx: number[]) => {
    enterUiMode(idx, 'share')
  }

  const initTimeSync = () => timeSync()
    .then(correction => setTimeCorrection(correction))
    .catch(e => setTimeCorrection(0))

  const updateIntersectionSettings = (intersectionSettings: IntersectionSettings) => {
    setIntersectionSettings(intersectionSettings)
    setCurrentTimestamp(clock.now())
  }

  const onAddToGroup = (groupIdx: number) => {
    setLightSettings([...lightSettings, DEFAULT_LIGHT_SETTINGS])
    setGroupUiStates([...groupUiStates, new LightUiState(DEFAULT_LIGHT_SETTINGS.phases[0].state)])
    setUiMode('none')
    setExpanded(lightSettings.length)
    setGroups([...groups, groupIdx])
  }

  const groupingToGroups = (grouping: number[][]) => {
    const newGroups = []
    for (let groupIdx = 0; groupIdx < grouping.length; groupIdx++) {
      const group = grouping[groupIdx]
      for (let lightIdx of group) {
        newGroups[lightIdx] = groupIdx
      }
    }
    return newGroups
  }

  const onUngroup = (groupIdx: number) => {
    const removedGroup = grouping[groupIdx]
    const newGrouping = grouping.flatMap((group, idx) => idx == groupIdx ? removedGroup.map(x => [x]) : [group])
    setGroups(groupingToGroups(newGrouping))
  }

  const onGroupUp = (groupIdx: number) => {
    const initAcc: number[][] = []
    const newGrouping = grouping.reduce((acc, group, idx) => idx != groupIdx ? [...acc, group] : [...acc.slice(0, -1), [...acc[acc.length - 1], ...group]], initAcc)
    setGroups(groupingToGroups(newGrouping))
  }

  const onAdd = () => {
    onAddToGroup(groups.length == 0 ? 0 : Math.max.apply(null, groups) + 1)
  }

  const onDeleteGroup = (groupToDelete: number) => {
    const indicesToDelete = grouping[groupToDelete]
    setLightSettings([...lightSettings].filter((ls, i) => !indicesToDelete.includes(i)))
    setGroups([...groups].filter((group, i) => !indicesToDelete.includes(i)).map(group => group > groupToDelete ? group - 1 : group))
    setGroupUiStates([...groupUiStates].filter((ui, i) => groupToDelete != i))
    setUiMode('none')
  }

  const getShareUrl = () => {
    
    const selectedLightSettings = lightSettings.filter((ls, index) => effectivelySelected.includes(index))

    const search = `?intersection=${IntersectionSettingsParser.serialize(intersectionSettings)}&lights=${LightSettingsParser.serialize(selectedLightSettings)}`

    const baseUrl = typeof window === "undefined" ? process.env.NEXT_PUBLIC_SITE_URL : window.location.origin

    return baseUrl + '/intersection' + search
  }  

  // once
  useEffect(() => {
    initTimeSync()
  }, [])

  // after each render
  useEffect(() => {
    clock.register([...lights, failure, wrapListener]).then(setCurrentTimestamp)
    return () => {
      clock.unregister()
    }
  })

  const intersectionGroups = grouping.map((lightIndices, groupIdx) => {
    return (
      <LightGroup
        key={groupIdx}
        currentTimestamp={currentTimestamp}
        lightUiState={groupUiStates[groupIdx]}
        setLightUiState={(lightUiState: LightUiState) => updateGroupUiState(lightUiState, groupIdx)}
        onDelete={() => onDeleteGroup(groupIdx)}
        onFullscreen={() => enterFullscreenMode(lightIndices)}
        onShare={() => enterShareMode(lightIndices)}
        onAdd={() => onAddToGroup(groupIdx)}
        onGroup={() => onGroupUp(groupIdx)}
        onUngroup={() => onUngroup(groupIdx)}
        lightRecords={lightIndices.map(lightIdx => lightRecords[lightIdx])}
      />
    )
  })

  const fullscreenContents = lights.map((light, index) => (
    <LightHead 
      key={`fullscreen-light-${index}`} 
      currentTimestamp={currentTimestamp} 
      light={light} 
      lightConfig={light.lightConfig} 
      maxHeight={100} 
      maxWidth={100}
    />
  ))

  return (
    <Stack spacing={2} sx={{ p: 1, m: 1 }}>
   
      <Typography variant='h6'>Settings</Typography>
      
      <IntersectionSettingsPanel
        intersectionSettings={intersectionSettings}
        updateIntersectionSettings={updateIntersectionSettings}
        timeCorrection={timeCorrection}
        setTimeCorrection={setTimeCorrection}
        initTimeSync={initTimeSync}
      />

      <Typography variant='h6'>Traffic Lights</Typography>
  
      {intersectionGroups}

      <Fullscreen
        enabled={uiMode == 'fullscreen'}
        onDisabled={exitUiMode}
        grouping={grouping}
      >
        {fullscreenContents}
      </Fullscreen>

      <ShareDialog
        url={getShareUrl()}
        open={uiMode == 'share'}
        onClose={exitUiMode}
      />

      {expanded != null &&
        <LightDetails
          open={expanded != null}
          currentTimestamp={currentTimestamp}
          light={lights[expanded]}
          lightConfig={lightConfigs[expanded]}
          lightUiState={groupUiStates[groups[expanded]]}
          onClose={() => setExpanded(null)}
          onLightSettingsChange={(settings: LightSettings) => updateLightSettings(settings, expanded)}
          onFullscreen={() => enterFullscreenMode([expanded])}
          onShare={() => enterShareMode([expanded])}
          setLightUiState={(lightUiState: LightUiState) => updateGroupUiState(lightUiState, groups[expanded])}
        />
      }

      <Fab 
        color="primary" 
        aria-label="add" 
        onClick={onAdd} 
        style={{ margin: 0, top: 'auto', right: 20, bottom: 20, left: 'auto', position: 'fixed' }}
      >
        <AddIcon />
      </Fab>
    </Stack>
  )
}
