"use client"

import { useState, useEffect, forwardRef, useImperativeHandle, Ref } from 'react'
import LightComponent from './Light'
import Clock from '../domain/Clock'
import TrafficLight from '../domain/TrafficLight'
import LightConfig, { LightSettings, DEFAULT_LIGHT_SETTINGS } from '../domain/LightConfig'
import Failure from '../domain/Failure'
import Input from './Input'
import { Card, CardContent, Collapse, Fab, Stack, Checkbox, IconButton, CardActions, Box, Button, Tabs, Tab, Dialog, Slide, AppBar, Toolbar, Typography, List, ListItemButton, ListItemText, Divider, FormControlLabel, CardHeader, Avatar } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import useStateParams, { LightSettingsSerDeser, IntersectionSettingsSerDeser, IntSerDeser } from '../url'
import IntersectionSettings, { DEFAULT_INTERSECTION_SETTINGS } from '../domain/IntersectionSettings'
import SettingsIcon from '@mui/icons-material/Settings'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import Fullscreen from './Fullscreen'
import LightHead from './LightHead'
import React from 'react'
import ShareDialog from './ShareDialog'
import timeSync from '../domain/timeSync'
import ExpandDialog from './ExpandDialog'
import GridGoldenratioIcon from '@mui/icons-material/GridGoldenratio'

export type BatchMode = 'none' | 'share' | 'fullscreen'

// Browser back button on expand (share dialog?)
// Offline usage
// Wake lock fix

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

  const [expanded, setExpanded] = useStateParams<number | null>(null, "expand", IntSerDeser)

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
      _setSelected([])
      setFullscreenMode(lightConfigs.length > 1 ? selected : [0])
    },

    enterShareDialog() {
      _setSelected([])
      setShareMode(lightConfigs.length > 1 ? selected : [0])
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

  const expandDialog = expanded == null ? null : (
    <ExpandDialog
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

  return (
    <Stack spacing={2} sx={{ p: 1, m: 1 }}>
      <Card>
        <CardActions>
          <Tabs value={selectedTab} aria-label="basic tabs example">
            <Tab label='Settings' iconPosition='start' disabled={true} {...a11yProps(0)}/>
            <Tab icon={<GridGoldenratioIcon />} label='Intersection' iconPosition='top' {...a11yProps(1)} />
            <Tab icon={<AccessTimeIcon />} label='Time' iconPosition='top' {...a11yProps(2)} />
          </Tabs>
        </CardActions>

        <CustomTabPanel value={selectedTab} index={1}>
          <CardContent>
            <Input 
              label="Cycle length" 
              id="cycle-length" 
              min={10}
              max={180}
              value={intersectionSettings.cycleLength / 1000} 
              onChange={ e => updateIntersectionSettings({ ...intersectionSettings, cycleLength: Number(e.target.value) * 1000 }) } 
            />
            <Input 
              label="Failure duration" 
              id="failure-duration" 
              min={10}
              max={180}
              value={intersectionSettings.failure.duration / 1000} 
              onChange={ e => updateIntersectionSettings({ ...intersectionSettings, failure: { probability: intersectionSettings.failure.probability, duration: Number(e.target.value) * 1000 } }) } 
            />
            <Input 
              label="Failure probability" 
              id="failure-probability" 
              min={0}
              max={1}
              step={0.1}
              value={intersectionSettings.failure.probability} 
              onChange={ e => updateIntersectionSettings({ ...intersectionSettings, failure: { duration: intersectionSettings.failure.duration, probability: Number(e.target.value) } }) } 
            />
          </CardContent>
        </CustomTabPanel>
        <CustomTabPanel value={selectedTab} index={2}>
          <CardContent>
            <Input 
              label="Time correction" 
              id="time-correction" 
              min={-1000}
              max={1000}
              step={10}
              value={timeCorrection} 
              onChange={e => setTimeCorrection(e.target.value)} 
            />
            <Button variant='outlined' onClick={initTimeSync}>Sync time</Button>
          </CardContent>
        </CustomTabPanel>
      </Card>

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
        { lights.filter((light, index) => fullscreenMode.includes(index)).map((light, index) =>
          <Box key={`fullscreen-light-${index}`} sx={{ mx: 2 }}>
            <LightHead currentTimestamp={currentTimestamp} light={light} lightConfig={light.lightConfig} height='95vh'/>
          </Box>
        )}
      </Fullscreen>

      <ShareDialog
        url={getShareUrl()}
        open={shareMode.length > 0}
        onClose={() => setShareMode([])}
      />

      {expandDialog}

      <Fab color="primary" aria-label="add" onClick={onAdd} style={{ margin: 0, top: 'auto', right: 20, bottom: 20, left: 'auto', position: 'fixed' }}>
        <AddIcon />
      </Fab>
    </Stack>
  )
})
