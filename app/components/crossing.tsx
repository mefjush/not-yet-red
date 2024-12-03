"use client"

import { useState, useEffect, ReactNode, forwardRef, useImperativeHandle, Ref } from 'react'
import LightComponent from './light'
import Clock from '../domain/clock'
import TrafficLight from '../domain/traffic-light'
import LightConfig, { LightSettings, DEFAULT_LIGHT_SETTINGS } from '../domain/light-config'
import Failure from '../domain/failure'
import Input from './input'
import { Card, CardContent, Collapse, Fab, Stack, Checkbox, IconButton, CardActions, Box, Button, Tabs, Tab, Dialog, Slide, AppBar, Toolbar, Typography, List, ListItemButton, ListItemText, Divider, FormControlLabel, CardHeader, Avatar } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import useStateParams, { LightSettingsSerDeser, CrossingSettingsSerDeser } from '../url'
import CrossingSettings, { DEFAULT_CROSSING_SETTINGS } from '../domain/crossing-settings'
import { ExpandMore } from './expand-more'
import ShareIcon from '@mui/icons-material/Share'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import SettingsIcon from '@mui/icons-material/Settings'
import DeleteIcon from '@mui/icons-material/Delete'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import Fullscreen from './fullscreen'
import LightIcon from './light-icon'
import React from 'react'
import ShareDialog from './share-dialog'
import syncTime from '../domain/time-sync'
import SyncAltIcon from '@mui/icons-material/SyncAlt'

export type BatchMode = 'none' | 'share' | 'fullscreen'

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

export default forwardRef(function CrossingComponent({ selectionMode, onSelectionChanged }: { selectionMode: boolean, onSelectionChanged: (total: number, selected: number) => void }, ref: Ref<RefObject>) {

  const [crossingSettings, setCrossingSettings] = useStateParams(DEFAULT_CROSSING_SETTINGS, "crossing", CrossingSettingsSerDeser)

  const [timeCorrection, setTimeCorrection] = useState(0)

  const [currentTimestamp, setCurrentTimestamp] = useState(Date.now())

  const [expanded, setExpanded] = useState(false)

  const [quickEditEnabled, setQuickEditEnabled] = useState(true)

  const [selected, _setSelected] = useState<number[]>([])

  const [fullscreenMode, setFullscreenMode] = useState<number[]>([])

  const [shareMode, setShareMode] = useState<number[]>([])

  const [lightSettings, setLightSettings] = useStateParams([DEFAULT_LIGHT_SETTINGS], "lights", LightSettingsSerDeser)

  const failure = new Failure(crossingSettings.failure.duration, crossingSettings.failure.probability)

  const hasFailed = failure.currentState(currentTimestamp)

  const lightConfigs = lightSettings.map(lightSetting => new LightConfig(crossingSettings, lightSetting))

  const lights = lightConfigs.map(lightConfig => new TrafficLight(lightConfig, hasFailed))

  const [selectedTab, setSelectedTab] = React.useState<number | false>(0)

  useImperativeHandle(ref, () => ({

    handleSelectAll(value: boolean) {
      onAllSelectionChanged(value)
    },

    enterFullscreen() {
      setFullscreenMode(lightConfigs.length > 1 ? selected : [0])
    },

    enterShareDialog() {
      setShareMode(lightConfigs.length > 1 ? selected : [0])
    }

  }));

  const wrapListener = {
    nextStateTimestamp: (timestamp: number) => (Math.floor(timestamp / crossingSettings.cycleLength) + 1) * crossingSettings.cycleLength
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

  const initTimeSync = () => syncTime()
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

  const updateCrossingSettings = (crossingSettings: CrossingSettings) => {
    setCrossingSettings(crossingSettings)
    setCurrentTimestamp(clock.now())
  }

  const onAdd = () => {
    const updatedLightSettings = [...lightSettings, DEFAULT_LIGHT_SETTINGS]
    setLightSettings(updatedLightSettings)
    onSelectionChanged(updatedLightSettings.length, selected.length)
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

    const search = `?crossing=${CrossingSettingsSerDeser.serialize(crossingSettings)}&lights=${LightSettingsSerDeser.serialize(selectedLightSettings)}`

    const baseUrl = typeof window === "undefined" ? process.env.NEXT_PUBLIC_SITE_URL : window.location.origin
    // const baseUrl = "http://192.168.0.106:3000" 
    return baseUrl + search
  }  

  return (
    <Stack spacing={2} sx={{ p: 1, m: 1 }}>
      <Card>
        <CardActions>
          <Tabs value={selectedTab} aria-label="basic tabs example">
            <Tab icon={<SettingsIcon />} label='Crossing' iconPosition='start' {...a11yProps(0)} />
            <Tab icon={<AccessTimeIcon />} label='Time' iconPosition='start' {...a11yProps(1)} />
          </Tabs>
        </CardActions>

        <CustomTabPanel value={selectedTab} index={0}>
          <CardContent>
            <Input 
              label="Cycle length" 
              id="cycle-length" 
              min={10}
              max={180}
              value={crossingSettings.cycleLength / 1000} 
              onChange={ e => updateCrossingSettings({ ...crossingSettings, cycleLength: Number(e.target.value) * 1000 }) } 
            />
            <Input 
              label="Failure duration" 
              id="failure-duration" 
              min={10}
              max={180}
              value={crossingSettings.failure.duration / 1000} 
              onChange={ e => updateCrossingSettings({ ...crossingSettings, failure: { probability: crossingSettings.failure.probability, duration: Number(e.target.value) * 1000 } }) } 
            />
            <Input 
              label="Failure probability" 
              id="failure-probability" 
              min={0}
              max={1}
              step={0.1}
              value={crossingSettings.failure.probability} 
              onChange={ e => updateCrossingSettings({ ...crossingSettings, failure: { duration: crossingSettings.failure.duration, probability: Number(e.target.value) } }) } 
            />
          </CardContent>
        </CustomTabPanel>
        <CustomTabPanel value={selectedTab} index={1}>
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
          onDelete={lights.length > 1 ? () => onDelete([index]) : undefined}
          onSelectionChange={(checked) => checked ? setSelected([...selected, index]) : setSelected(selected.filter(x => x != index))}
          onFullscreen={() => setFullscreenMode([index])}
          onShare={() => setShareMode([index])}
          quickEditEnabled={quickEditEnabled}
          toggleQuickEdit={() => setQuickEditEnabled(!quickEditEnabled)}
          selectionMode={selectionMode}
        />
      )}

      <Fullscreen
        enabled={fullscreenMode.length > 0}
        onDisabled={() => setFullscreenMode([])}
      >
        { lights.filter((light, index) => fullscreenMode.includes(index)).map((light, index) =>
          <Box key={`fullscreen-light-${index}`} sx={{ mx: 2 }}>
            <LightIcon currentTimestamp={currentTimestamp} light={light} lightConfig={light.lightConfig} height='95vh'/>
          </Box>
        )}
      </Fullscreen>

      <ShareDialog
        url={getShareUrl()}
        open={shareMode.length > 0}
        onClose={() => setShareMode([])}
      />
      <Fab color="primary" aria-label="add" onClick={onAdd} style={{ margin: 0, top: 'auto', right: 20, bottom: 20, left: 'auto', position: 'fixed' }}>
        <AddIcon />
      </Fab>
    </Stack>
  )
})
