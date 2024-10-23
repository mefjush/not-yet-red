"use client"

import { useState, useEffect } from 'react'
import LightComponent from './light'
import Clock from '../domain/clock'
import TrafficLight from '../domain/traffic-light'
import LightConfig, { LightSettings, DEFAULT_LIGHT_SETTINGS } from '../domain/light-config'
import Failure from '../domain/failure'
import Input from './input'
import { Card, CardContent, Collapse, Fab, Stack, Checkbox, IconButton, CardActions, Tabs, Tab, Box, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import useStateParams, { LightSettingsSerDeser, CrossingSettingsSerDeser } from '../url'
import { DEFAULT_CROSSING_SETTINGS } from '../domain/crossing-settings'
import { ExpandMore } from './expand-more'
import ShareIcon from '@mui/icons-material/Share'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import SettingsIcon from '@mui/icons-material/Settings'
import DeleteIcon from '@mui/icons-material/Delete'
import Fullscreen from './fullscreen'
import LightIcon from './light-icon'
import React from 'react'
import ShareDialog from './share-dialog'

export default function CrossingComponent({time}: {time: number}) {

  const [crossingSettings, setCrossingSettings] = useStateParams(DEFAULT_CROSSING_SETTINGS, "crossing", CrossingSettingsSerDeser)

  const [currentTimestamp, setCurrentTimestamp] = useState(() => time)

  const [expanded, setExpanded] = useState(false)

  const [selected, setSelected] = useState<number[]>([])

  const [fullscreenMode, setFullscreenMode] = useState<number[]>([])

  const [shareMode, setShareMode] = useState<number[]>([])

  const [lightSettings, setLightSettings] = useStateParams([DEFAULT_LIGHT_SETTINGS], "lights", LightSettingsSerDeser)

  const failure = new Failure(crossingSettings.failure.duration, crossingSettings.failure.probability)

  const hasFailed = failure.currentState(currentTimestamp)

  const lightConfigs = lightSettings.map(lightSetting => new LightConfig(crossingSettings, lightSetting))

  const lights = lightConfigs.map(lightConfig => new TrafficLight(lightConfig, hasFailed))
  
  const wrapListener = {
    nextStateTimestamp: (timestamp: number) => (Math.floor(timestamp / crossingSettings.cycleLength) + 1) * crossingSettings.cycleLength
  }

  useEffect(() => {
    const clock = new Clock()
    clock.register([...lights, failure, wrapListener], setCurrentTimestamp)
    return () => {
      clock.unregister()
    }
  }, [lightSettings, crossingSettings, currentTimestamp])

  const updateLightSettings = (settings: LightSettings, index: number) => {
    const copy = [...lightSettings]
    copy.splice(index, 1, settings)
    setLightSettings(copy)
  }

  const onAdd = () => {
    setLightSettings([...lightSettings, DEFAULT_LIGHT_SETTINGS])
  }

  const onDelete = (indicesToDelete: number[]) => {
    setSelected([])
    setLightSettings([...lightSettings].filter((ls, i) => !indicesToDelete.includes(i)))
  }

  const handleExpandClick = () => {
    setExpanded(!expanded);
  }

  const onAllSelectionChanged = (b: boolean) => {
    setSelected(b ? lights.map((l, i) => i) : [])
  }

  const getShareUrl = function() {
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
      <Card sx={{ position: 'sticky', top: '2px', zIndex: 100 }}>
        <CardActions>
          <Checkbox 
            checked={selected.length == lightSettings.length} 
            indeterminate={selected.length != lightSettings.length && selected.length > 0} 
            aria-label='select all'
            onChange={e => onAllSelectionChanged(e.target.checked)} 
          />
          <IconButton 
            disabled={ selected.length == 0 } 
            aria-label="fullscreen" 
            onClick={() => setFullscreenMode(selected)}
          >
            <FullscreenIcon />
          </IconButton>
          <IconButton 
            disabled={ selected.length == 0 } 
            aria-label="share" 
            onClick={() => setShareMode(selected)}
          >
            <ShareIcon />
          </IconButton>
          <IconButton 
            disabled={ selected.length == 0 } 
            aria-label="delete" 
            onClick={() => onDelete(selected)}
          >
            <DeleteIcon />
          </IconButton>

          <ExpandMore
              expand={expanded}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
              style={{marginLeft: 'auto'}}
            >
              <SettingsIcon />
            </ExpandMore>
        </CardActions>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <form>
              <Input 
                label="Cycle length" 
                id="cycle-length" 
                min={10} 
                max={180}
                value={crossingSettings.cycleLength / 1000} 
                onChange={ e => setCrossingSettings({ ...crossingSettings, cycleLength: Number(e.target.value) * 1000 }) } 
              />
              <Input 
                label="Failure duration" 
                id="failure-duration" 
                min={10}
                max={180} 
                value={crossingSettings.failure.duration / 1000} 
                onChange={ e => setCrossingSettings({ ...crossingSettings, failure: { probability: crossingSettings.failure.probability, duration: Number(e.target.value) * 1000 } }) } 
              />
              <Input 
                label="Failure probability" 
                id="failure-probability" 
                min={0} 
                max={1} 
                step={0.1} 
                value={crossingSettings.failure.probability} 
                onChange={ e => setCrossingSettings({ ...crossingSettings, failure: { duration: crossingSettings.failure.duration, probability: Number(e.target.value) } }) } 
              />
            </form>
          </CardContent>
        </Collapse>
      </Card>

      { lights.map((light, index) =>
        <LightComponent
            key={index}
            index={index}
            currentTimestamp={currentTimestamp}
            light={light}
            lightConfig={lightConfigs[index]}
            selected={selected.includes(index)}
            onLightSettingsChange={(settings: LightSettings) => updateLightSettings(settings, index)}
            onDelete={lights.length > 1 ? () => onDelete([index]) : undefined}
            onSelectionChange={(checked) => checked ? setSelected([...selected, index]) : setSelected(selected.filter(x => x != index))}
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
            <LightIcon currentTimestamp={currentTimestamp} light={light} height='95vh'/>
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
}
