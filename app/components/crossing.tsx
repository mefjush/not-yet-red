"use client"

import { useState, useEffect } from 'react'
import LightComponent from './light'
import Clock from '../domain/clock'
import TrafficLight from '../domain/traffic-light'
import LightConfig, { LightSettings, DEFAULT_LIGHT_SETTINGS } from '../domain/light-config'
import Failure from '../domain/failure'
import Input from './input'
import { Card, CardContent, Collapse, Fab, Stack, Divider } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import useStateParams, { LightSettingsSerDeser, CrossingSettingsSerDeser } from '../url'
import { DEFAULT_CROSSING_SETTINGS } from '../domain/crossing-settings'

export default function CrossingComponent({time, expanded}: {time: number, expanded: boolean}) {

  const [crossingSettings, setCrossingSettings] = useStateParams(DEFAULT_CROSSING_SETTINGS, "crossingSettings", CrossingSettingsSerDeser)

  const [currentTimestamp, setCurrentTimestamp] = useState(() => time)

  const [lightSettings, setLightSettings] = useStateParams([DEFAULT_LIGHT_SETTINGS], "lightSettings", LightSettingsSerDeser)

  const failure = new Failure(crossingSettings.failure.duration, crossingSettings.failure.probability)

  const hasFailed = failure.currentState(currentTimestamp)

  const lightConfigs = lightSettings.map(lightSetting => new LightConfig(crossingSettings, lightSetting))

  const lights = lightConfigs.map(lightConfig => new TrafficLight(lightConfig, hasFailed))

  useEffect(() => {
    const clock = new Clock()
    clock.register([...lights, failure], setCurrentTimestamp)
    return () => {
      clock.unregister()
    }
  }, [lightSettings, crossingSettings, currentTimestamp])

  const updateLightSettings = (settings: LightSettings, index: number) => {
    const copy = [...lightSettings]
    copy.splice(index, 1, settings)
    setLightSettings(copy)
  }

  const onClone = (index: number) => {
    const copy = [...lightSettings]
    copy.splice(index + 1, 0, lightSettings[index])
    setLightSettings(copy)
  }

  const onDelete = (index: number) => {
    const copy = [...lightSettings]
    copy.splice(index, 1)
    setLightSettings(copy)
  }

  return (
    <>
      <Stack spacing={2} sx={{ p: 1, m: 1 }}>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Card>
            <CardContent>
              <h2>Settings</h2>
              <form>
                <Input label="Cycle length" id="cycle-length" min={10} max={180} value={crossingSettings.cycleLength / 1000} onChange={ e => setCrossingSettings({ ...crossingSettings, cycleLength: Number(e.target.value) * 1000 }) } />
                <Input label="Failure duration" id="failure-duration" min={10} max={180} value={crossingSettings.failure.duration / 1000} onChange={ e => setCrossingSettings({ ...crossingSettings, failure: { probability: crossingSettings.failure.probability, duration: Number(e.target.value) * 1000 } }) } />
                <Input label="Failure probability" id="failure-probability" min={0} max={1} step={0.1} value={crossingSettings.failure.probability} onChange={ e => setCrossingSettings({ ...crossingSettings, failure: { duration: crossingSettings.failure.duration, probability: Number(e.target.value) } }) } />
              </form>
            </CardContent>
          </Card>
          <Divider></Divider>
        </Collapse>

        { lights.map((light, index) =>
          <LightComponent
              key={index}
              index={index}
              currentTimestamp={currentTimestamp}
              light={light}
              lightConfig={lightConfigs[index]}
              onLightSettingsChange={(settings: LightSettings) => updateLightSettings(settings, index)}
              onDelete={lights.length > 1 ? () => onDelete(index) : undefined}
          />
        )}
        <Fab color="primary" aria-label="add" onClick={() => onClone(lightSettings.length - 1)} style={{ margin: 0, top: 'auto', right: 20, bottom: 20, left: 'auto', position: 'fixed' }}>
          <AddIcon />
        </Fab>
      </Stack>
    </>
  )
}
