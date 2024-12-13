"use client"

import { useState, useEffect } from 'react'
import LightComponent from './Light'
import Clock from '../domain/Clock'
import TrafficLight from '../domain/TrafficLight'
import LightConfig, { LightSettings, DEFAULT_LIGHT_SETTINGS } from '../domain/LightConfig'
import Failure from '../domain/Failure'
import Input from './Input'
import { Card, CardContent, Collapse, Fab, Stack, Box, Button, Tabs, Tab, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { LightSettingsParser, IntersectionSettingsParser } from '../url'
import IntersectionSettings, { DEFAULT_INTERSECTION_SETTINGS } from '../domain/IntersectionSettings'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import Fullscreen from './Fullscreen'
import LightHead from './LightHead'
import React from 'react'
import ShareDialog from './ShareDialog'
import timeSync from '../domain/timeSync'
import LightDetails from './LightDetails'
import GridGoldenratioIcon from '@mui/icons-material/GridGoldenratio'
import LightUiState from '../domain/LightUiState'
import LightModel from '../domain/LightModel'
import { Options, parseAsInteger, useQueryState } from 'nuqs'


export type BatchMode = 'none' | 'share' | 'fullscreen'

const historyPush: Options = { history: 'push' }

// Offline usage

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number | false
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <Collapse in={value == index} unmountOnExit>
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box>{children}</Box>}
      </div>
    </Collapse>
  )
}

export default function IntersectionComponent({ selectionMode, allSelected, onSelectionChanged, uiMode, setUiMode }: { selectionMode: boolean, allSelected: boolean | undefined, onSelectionChanged: (total: number, selected: number) => void, uiMode: BatchMode, setUiMode: (uiMode: BatchMode) => void }) {

  const [intersectionSettings, setIntersectionSettings] = useQueryState(
    "intersection", 
    IntersectionSettingsParser.withDefault(DEFAULT_INTERSECTION_SETTINGS)
  )

  const [lightSettings, setLightSettings] = useQueryState(
    "lights", 
    LightSettingsParser.withDefault([DEFAULT_LIGHT_SETTINGS])
  )

  const [expanded, setExpanded] = useQueryState("e", parseAsInteger.withOptions(historyPush))

  const [timeCorrection, setTimeCorrection] = useState(0)

  const [currentTimestamp, setCurrentTimestamp] = useState(Date.now())

  const [lightUiStates, setLightUiStates] = useState(lightSettings.map(ls => new LightUiState(false, ls.phases[0].state)))

  const [selectedTab, setSelectedTab] = React.useState<number | false>(false)

  const failure = new Failure(intersectionSettings.failure.duration, intersectionSettings.failure.probability)

  const hasFailed = failure.currentState(currentTimestamp)

  const lightConfigs = lightSettings.map(lightSetting => new LightConfig(intersectionSettings, lightSetting))

  const updateLightSettings = (settings: LightSettings, index: number) => {
    const copy = [...lightSettings]
    copy.splice(index, 1, settings)
    setLightSettings(copy)
    setCurrentTimestamp(clock.now())
  }

  const updateLightUiState = (lightUiState: LightUiState, index: number) => {
    setLightUiStates((prev) => {
      const copy = [...prev]
      copy.splice(index, 1, lightUiState)
      return copy
    })
  }

  const lightModels = lightUiStates.map((lightUiState, idx) => 
    new LightModel(
      lightUiState,
      (lightUiState: LightUiState) => updateLightUiState(lightUiState, idx),
      (selected: Boolean) => onSelectionChanged(lightModels.length, lightModels.filter(lm => lm.isSelected()).length + (selected ? 1 : -1))
    )
  )

  const lights = lightConfigs.map(lightConfig => new TrafficLight(lightConfig, hasFailed))

  if (allSelected) {
    lightModels.forEach(lm => lm.setSelected(true))  
  } else if (allSelected === false) {
    lightModels.forEach(lm => lm.setSelected(false))
  }

  const selected = lightModels.map((model, idx) => model.isSelected() ? idx : -1).filter(x => x >= 0)

  const wrapListener = {
    nextStateTimestamp: (timestamp: number) => (Math.floor(timestamp / intersectionSettings.cycleLength) + 1) * intersectionSettings.cycleLength
  }

  const handleTabChange = (newValue: number) => {
    setSelectedTab(newValue === selectedTab ? false : newValue)
  }

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
      onClick: () => handleTabChange(index),
    }
  }

  const clock = new Clock(timeCorrection)

  const _setUiMode = (idx: number | null, uiMode: BatchMode) => {
    if (idx != null) {
      lightModels[idx].setSelected(true)
    }
    setUiMode(idx != null ? uiMode : 'none')
  }

  const _setFullscreen = (idx: number | null) => {
    _setUiMode(idx, 'fullscreen')
  }

  const _setShare = (idx: number | null) => {
    _setUiMode(idx, 'share')
  }

  const initTimeSync = () => timeSync()
    .then(correction => setTimeCorrection(correction))
    .catch(e => setTimeCorrection(0))

  // once
  useEffect(() => {
    onSelectionChanged(lightConfigs.length, selected.length) // to render the toolbar
    initTimeSync()
  }, [])

  // after each render
  useEffect(() => {
    onSelectionChanged(lightConfigs.length, lightModels.filter(m => m.isSelected()).length) // not so ideal
    clock.register([...lights, failure, wrapListener]).then(setCurrentTimestamp)
    return () => {
      clock.unregister()
    }
  })

  const updateIntersectionSettings = (intersectionSettings: IntersectionSettings) => {
    setIntersectionSettings(intersectionSettings)
    setCurrentTimestamp(clock.now())
  }

  const onAdd = () => {
    setLightSettings([...lightSettings, DEFAULT_LIGHT_SETTINGS])
    setLightUiStates([...lightUiStates, new LightUiState(false, DEFAULT_LIGHT_SETTINGS.phases[0].state)])
    setExpanded(lightSettings.length)
  }

  const onDelete = (indicesToDelete: number[]) => {
    setLightSettings([...lightSettings].filter((ls, i) => !indicesToDelete.includes(i)))
    setLightUiStates([...lightUiStates].filter((ui, i) => !indicesToDelete.includes(i)))
  }

  const getShareUrl = () => {
    
    const selectedLightSettings = lightSettings.filter((ls, index) => selected.includes(index))

    const search = `?intersection=${IntersectionSettingsParser.serialize(intersectionSettings)}&lights=${LightSettingsParser.serialize(selectedLightSettings)}`

    const baseUrl = typeof window === "undefined" ? process.env.NEXT_PUBLIC_SITE_URL : window.location.origin

    return baseUrl + search
  }  

  const fullscreenContents = () => {
    const fullscreenLights = lights.filter((light, index) => selected.includes(index))

    const size = fullscreenLights.length < 3 ? '95vh' : `${3 * 70 / fullscreenLights.length}vw`

    return fullscreenLights.map((light, index) => (
      <Box key={`fullscreen-light-${index}`}>
        <LightHead currentTimestamp={currentTimestamp} light={light} lightConfig={light.lightConfig} height={size}/>
      </Box>
    ))
  }

  const intersectionLights = lights.map((light, index) =>
    <LightComponent
      key={index}
      currentTimestamp={currentTimestamp}
      light={light}
      lightConfig={lightConfigs[index]}
      onLightSettingsChange={(settings: LightSettings) => updateLightSettings(settings, index)}
      selectionMode={selectionMode}
      setExpanded={() => {
        setExpanded(index)
        window.history.pushState({ dialogOpen: true }, '')
      }}
      expanded={index === expanded}
      onDelete={() => onDelete([index])}
      onFullscreen={() => _setFullscreen(index)}
      onShare={() => _setShare(index)}
      lightModel={lightModels[index]}
    />
  )

  return (
    <Stack spacing={2} sx={{ p: 1, m: 1 }}>
   
      <Typography variant='h6'>Settings</Typography>
      <Card>
        <Tabs value={selectedTab} aria-label="basic tabs example">
          <Tab icon={<GridGoldenratioIcon />} label='Intersection' iconPosition='top' {...a11yProps(0)} />
          <Tab icon={<AccessTimeIcon />} label='Time' iconPosition='top' {...a11yProps(1)} />
        </Tabs>

        <CustomTabPanel value={selectedTab} index={0}>
          <CardContent>
            <Input 
              label="Cycle length (s)"
              id="cycle-length" 
              min={10}
              max={180}
              value={intersectionSettings.cycleLength / 1000} 
              onChange={ e => updateIntersectionSettings({ ...intersectionSettings, cycleLength: Number(e.target.value) * 1000 }) } 
            />
            <Input 
              label="Failure duration (s)"
              id="failure-duration" 
              min={10}
              max={180}
              value={intersectionSettings.failure.duration / 1000} 
              onChange={ e => updateIntersectionSettings({ ...intersectionSettings, failure: { probability: intersectionSettings.failure.probability, duration: Number(e.target.value) * 1000 } }) } 
            />
            <Input 
              label="Failure probability (%)"
              id="failure-probability" 
              min={0}
              max={100}
              step={5}
              value={Math.round(intersectionSettings.failure.probability * 100)} 
              onChange={ e => updateIntersectionSettings({ ...intersectionSettings, failure: { duration: intersectionSettings.failure.duration, probability: Number(e.target.value) / 100 } }) } 
            />
          </CardContent>
        </CustomTabPanel>
        <CustomTabPanel value={selectedTab} index={1}>
          <CardContent>
            <Input 
              label="Time correction (s)" 
              id="time-correction" 
              min={-2}
              max={2}
              step={0.05}
              value={timeCorrection / 1000} 
              onChange={e => setTimeCorrection(e.target.value * 1000)} 
            />
            <Button variant='outlined' onClick={initTimeSync}>Sync time</Button>
          </CardContent>
        </CustomTabPanel>
      </Card>

      <Typography variant='h6'>Traffic Lights</Typography>
      { expanded == null && intersectionLights}

      <Fullscreen
        enabled={uiMode == 'fullscreen'}
        onDisabled={() => _setFullscreen(null)}
      >
        {fullscreenContents()}
      </Fullscreen>

      <ShareDialog
        url={getShareUrl()}
        open={uiMode == 'share'}
        onClose={() => _setShare(null)}
      />

      {expanded != null &&
        <LightDetails
          open={expanded != null}
          onClose={() => setExpanded(null)}
          currentTimestamp={currentTimestamp}
          lightModel={lightModels[expanded]}
          light={lights[expanded]}
          lightConfig={lightConfigs[expanded]}
          onLightSettingsChange={(settings: LightSettings) => updateLightSettings(settings, expanded)}
          onFullscreen={() => _setFullscreen(expanded)}
          onShare={() => _setShare(expanded)}
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
