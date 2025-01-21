"use client"

import { useState, useEffect, ReactElement } from 'react'
import Clock from '../domain/Clock'
import TrafficLight from '../domain/TrafficLight'
import LightConfig, { LightSettings, DEFAULT_LIGHT_SETTINGS } from '../domain/LightConfig'
import Failure from '../domain/Failure'
import { Box, Button, Fab, Stack, Typography } from '@mui/material'
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
import { LightRecord } from './LightCard'
import CompressIcon from '@mui/icons-material/Compress'
import ExpandIcon from '@mui/icons-material/Expand'
import LightCard from './LightCard'

export type UiMode = 'none' | 'share' | 'fullscreen'
export type SelectionMode = 'none' | 'some' | 'all' | 'set-all' | 'set-none'

const historyPush: Options = { history: 'push' }

// TODOs
// preview mode (show groups in rows)
// delete one light
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

  const [lightUiStates, setLightUiStates] = useState(lightSettings.map((ls) => new LightUiState(ls.phases[0].state)))

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

  const updateLightUiState = (lightUiState: LightUiState, lightIdx: number) => {
    const copy = [...lightUiStates]
    copy.splice(lightIdx, 1, lightUiState)
    setLightUiStates(copy)
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

  const onUngroup = (groupIdx: number, splitIdx: number) => {
    const groupLeft = grouping[groupIdx].filter((x, idx) => idx <= splitIdx)
    const groupRight = grouping[groupIdx].filter((x, idx) => idx > splitIdx)
    const newGrouping = grouping.flatMap((group, idx) => idx == groupIdx ? [groupLeft, groupRight] : [group])
    setGroups(groupingToGroups(newGrouping))
  }

  const onGroupUp = (groupIdx: number) => {
    const initAcc: number[][] = []
    const newGrouping = grouping.reduce((acc, group, idx) => idx != groupIdx ? [...acc, group] : [...acc.slice(0, -1), [...acc[acc.length - 1], ...group]], initAcc)
    setGroups(groupingToGroups(newGrouping))
  }

  const onGroupDown = (groupIdx: number) => {
    const initAcc: number[][] = []
    const newGrouping = grouping.reduce((acc, group, idx) => idx != groupIdx + 1 ? [...acc, group] : [...acc.slice(0, -1), [...acc[acc.length - 1], ...group]], initAcc)
    setGroups(groupingToGroups(newGrouping))
  }

  const onAdd = () => {
    onAddToGroup(groups.length == 0 ? 0 : Math.max.apply(null, groups) + 1)
  }

  const onDeleteGroup = (groupToDelete: number) => {
    const indicesToDelete = grouping[groupToDelete]
    setLightSettings([...lightSettings].filter((ls, i) => !indicesToDelete.includes(i)))
    setGroups([...groups].filter((group, i) => !indicesToDelete.includes(i)).map(group => group > groupToDelete ? group - 1 : group))
    setUiMode('none')
  }

  const onDeleteOne = (lightIdx: number) => {
    const groupIdx = groups[lightIdx]
    if (grouping[groupIdx].length == 1) {
      console.log('deleting group ' + groupIdx)
      onDeleteGroup(groupIdx)
    } else {
      setLightSettings([...lightSettings].filter((ls, i) => i != lightIdx))
      setGroups([...groups].filter((group, i) => i != lightIdx))
      setUiMode('none')
    }
    setExpanded(null)
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

  const groupBoxStyle = { borderLeft: '5px solid', borderLeftColor: 'primary.main', pl: 2, py: 1 }
  
  const joinButton = (groupIdx: number): ReactElement => (
    <Box sx={{...groupBoxStyle, borderLeftColor: 'transparent'}}>
      <Button onClick={() => onGroupDown(groupIdx)} startIcon={<CompressIcon />}>
        Group
      </Button>
    </Box>
  )

  const splitButton = (groupIdx: number, splitIdx: number): ReactElement => (
    <Box sx={groupBoxStyle}>
      <Button onClick={() => onUngroup(groupIdx, splitIdx)} startIcon={<ExpandIcon />}>
        Split
      </Button>
    </Box>
  )
  
  const intersectionGroups = grouping.flatMap((lightIndices, groupIdx) => {

    const groupCards = lightIndices.flatMap((lightIdx, inGroupIdx) => {
      const card = (
        <Box sx={{...groupBoxStyle, borderLeftColor: lightIndices.length > 1 ? 'primary.main' : 'transparent'}}>
          <LightCard
            currentTimestamp={currentTimestamp}
            lightUiState={lightUiStates[lightIdx]}
            setLightUiState={(lightUiState: LightUiState) => updateLightUiState(lightUiState, lightIdx)}
            onDelete={() => onDeleteGroup(groupIdx)}
            onFullscreen={() => enterFullscreenMode(lightIndices)}
            onShare={() => enterShareMode(lightIndices)}
            onAdd={() => onAddToGroup(groupIdx)}
            onGroup={[() => onGroupUp(groupIdx), () => onGroupDown(groupIdx)]}
            onUngroup={(splitIdx) => onUngroup(groupIdx, splitIdx)}
            lightRecord={lightRecords[lightIdx]}
          />
        </Box>
      )
      return inGroupIdx < lightIndices.length - 1 ? [card, splitButton(groupIdx, inGroupIdx)] : [card]
    })

    return (
      <>
        { groupCards }
        { groupIdx < grouping.length - 1 && joinButton(groupIdx) }
      </>
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
  
      <Stack spacing={0}>
        {intersectionGroups}
      </Stack>

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
          lightUiState={lightUiStates[expanded]}
          onClose={() => setExpanded(null)}
          onLightSettingsChange={(settings: LightSettings) => updateLightSettings(settings, expanded)}
          onFullscreen={() => enterFullscreenMode([expanded])}
          onDelete={() => onDeleteOne(expanded)}
          onShare={() => enterShareMode([expanded])}
          setLightUiState={(lightUiState: LightUiState) => updateLightUiState(lightUiState, expanded)}
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
