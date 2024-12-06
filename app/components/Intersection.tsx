"use client"

import { useState, useEffect, forwardRef, useImperativeHandle, Ref } from 'react'
import LightComponent from './Light'
import Clock from '../domain/Clock'
import TrafficLight from '../domain/TrafficLight'
import LightConfig, { LightSettings, DEFAULT_LIGHT_SETTINGS } from '../domain/LightConfig'
import Failure from '../domain/Failure'
import Input from './Input'
import { Card, CardContent, Collapse, Fab, Stack, Box, Button, Tabs, Tab, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import useStateParams, { LightSettingsSerDeser, IntersectionSettingsSerDeser } from '../url'
import IntersectionSettings, { DEFAULT_INTERSECTION_SETTINGS } from '../domain/IntersectionSettings'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import Fullscreen from './Fullscreen'
import LightHead from './LightHead'
import React from 'react'
import ShareDialog from './ShareDialog'
import timeSync from '../domain/timeSync'
import LightDetails from './LightDetails'
import GridGoldenratioIcon from '@mui/icons-material/GridGoldenratio'

export type BatchMode = 'none' | 'share' | 'fullscreen'

// Browser back button on expand (share dialog?) - a simple adding expand=null as a param does not work correctly - it fucks up storing the light config in the url (query params modified from 2 places)
// Offline usage
// Wake lock fix
// Fix the slider near-the-edge rendering

export interface RefObject {
  
  handleSelectAll(value: boolean): void

  enterFullscreen(): void

  enterShareDialog(): void

}

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

export default forwardRef(function IntersectionComponent({ selectionMode, onSelectionChanged }: { selectionMode: boolean, onSelectionChanged: (total: number, selected: number) => void }, ref: Ref<RefObject>) {

  const [intersectionSettings, setIntersectionSettings] = useStateParams(DEFAULT_INTERSECTION_SETTINGS, "intersection", IntersectionSettingsSerDeser)

  const [timeCorrection, setTimeCorrection] = useState(0)

  const [currentTimestamp, setCurrentTimestamp] = useState(Date.now())

  const [selected, _setSelected] = useState<number[]>([])

  const [expanded, setExpanded] = useState<number | null>(null)

  const [fullscreenMode, setFullscreenMode] = useState<number[]>([])

  const [shareMode, setShareMode] = useState<number[]>([])

  const [lightSettings, setLightSettings] = useStateParams([DEFAULT_LIGHT_SETTINGS], "lights", LightSettingsSerDeser)

  const [selectedTab, setSelectedTab] = React.useState<number | false>(false)

  const failure = new Failure(intersectionSettings.failure.duration, intersectionSettings.failure.probability)

  const hasFailed = failure.currentState(currentTimestamp)

  const lightConfigs = lightSettings.map(lightSetting => new LightConfig(intersectionSettings, lightSetting))

  const lights = lightConfigs.map(lightConfig => new TrafficLight(lightConfig, hasFailed))

  useImperativeHandle(ref, () => ({

    handleSelectAll(value: boolean) {
      onAllSelectionChanged(value)
    },

    enterFullscreen() {
      setFullscreenMode(lightConfigs.length > 1 ? selected : [0])
      setSelected([])
    },

    enterShareDialog() {
      setShareMode(lightConfigs.length > 1 ? selected : [0])
      setSelected([])
    }

  }));

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

  const initTimeSync = () => timeSync()
    .then(correction => setTimeCorrection(correction))
    .catch(e => setTimeCorrection(0))
  
  const setSelected = (idx: number[]) => {
    _setSelected(idx)
    onSelectionChanged(lightConfigs.length, idx.length)
  }

  // once
  useEffect(() => {
    onSelectionChanged(lightConfigs.length, selected.length) // to render the toolbar
    initTimeSync()
  }, [])

  // after each render
  useEffect(() => {
    clock.register([...lights, failure, wrapListener]).then(setCurrentTimestamp)
    return () => {
      clock.unregister()
    }
  })

  const updateLightSettings = (settings: LightSettings, index: number) => {
    const copy = [...lightSettings]
    copy.splice(index, 1, settings)
    setLightSettings(copy)
    setCurrentTimestamp(clock.now())
  }

  const updateIntersectionSettings = (intersectionSettings: IntersectionSettings) => {
    setIntersectionSettings(intersectionSettings)
    setCurrentTimestamp(clock.now())
  }

  const onAdd = () => {
    const updatedLightSettings = [...lightSettings, DEFAULT_LIGHT_SETTINGS]
    setLightSettings(updatedLightSettings)
    onSelectionChanged(updatedLightSettings.length, selected.length)
    setExpanded(updatedLightSettings.length - 1)
  }

  const onDelete = (indicesToDelete: number[]) => {
    setSelected([])
    const updatedLightSettings = [...lightSettings].filter((ls, i) => !indicesToDelete.includes(i))
    setLightSettings(updatedLightSettings)
    onSelectionChanged(updatedLightSettings.length, 0)
  }

  const onAllSelectionChanged = (b: boolean) => {
    setSelected(b ? lights.map((l, i) => i) : [])
  }

  const getShareUrl = () => {
    if (shareMode.length == 0) {
      return ""
    } 

    const selectedLightSettings = lightSettings.filter((ls, index) => shareMode.includes(index))

    const search = `?intersection=${IntersectionSettingsSerDeser.serialize(intersectionSettings)}&lights=${LightSettingsSerDeser.serialize(selectedLightSettings)}`

    const baseUrl = typeof window === "undefined" ? process.env.NEXT_PUBLIC_SITE_URL : window.location.origin
    // const baseUrl = "http://192.168.0.106:3000" 
    return baseUrl + search
  }  

  const expandDialog = expanded && (
    <LightDetails
      open={expanded != null}
      onClose={() => setExpanded(null)}
      currentTimestamp={currentTimestamp}
      light={lights[expanded]}
      lightConfig={lightConfigs[expanded]}
      onLightSettingsChange={(settings: LightSettings) => updateLightSettings(settings, expanded)}
      onFullscreen={() => setFullscreenMode([expanded])}
      onShare={() => setShareMode([expanded])}
    />
  )

  const fullscreenContents = () => {
    const fullscreenLights = lights.filter((light, index) => fullscreenMode.includes(index))

    const size = fullscreenLights.length < 3 ? '95vh' : `${3 * 70 / fullscreenLights.length}vw`

    return fullscreenLights.map((light, index) => (
      <Box key={`fullscreen-light-${index}`}>
        <LightHead currentTimestamp={currentTimestamp} light={light} lightConfig={light.lightConfig} height={size}/>
      </Box>
    ))
  }

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

      { lights.map((light, index) =>
        <LightComponent
          key={index}
          currentTimestamp={currentTimestamp}
          light={light}
          lightConfig={lightConfigs[index]}
          selected={selected.includes(index)}
          onLightSettingsChange={(settings: LightSettings) => updateLightSettings(settings, index)}
          onSelectionChange={(checked) => checked ? setSelected([...selected, index]) : setSelected(selected.filter(x => x != index))}
          selectionMode={selectionMode}
          setExpanded={() => setExpanded(index)}
          expanded={index === expanded}
          onDelete={() => onDelete([index])}
          onFullscreen={() => setFullscreenMode([index])}
          onShare={() => setShareMode([index])}
        />
      )}

      <Fullscreen
        enabled={fullscreenMode.length > 0}
        onDisabled={() => setFullscreenMode([])}
      >
        {fullscreenContents()}
      </Fullscreen>

      <ShareDialog
        url={getShareUrl()}
        open={shareMode.length > 0}
        onClose={() => setShareMode([])}
      />

      {expandDialog}

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
})
