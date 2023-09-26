"use client"

import { useState, useEffect } from 'react'
import LightComponent from './light'
import Clock from './clock'
import TrafficLight from './trafficLight'
import LightSettings from './lightSettings'
import Failure from './failure'
import Input from './input'
import { Card, CardContent, Collapse, IconButton, Stack } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

const DEFAULT_FAILURE_DURATION = 10000
const DEFAULT_FAILURE_PROBABILITY = 0.1
const DEFAULT_CYCLE_LENGTH = 60000


export default function CrossingComponent({time, expanded}: {time: number, expanded: boolean}) {

  const DEFAULT_LIGHT_SETTINGS: LightSettings = { offset: 0, duration: { red: 30000 } };

  const [crossingSettings, setCrossingSettings] = useState({
    cycleLength: DEFAULT_CYCLE_LENGTH,
    failure: {
      probability: DEFAULT_FAILURE_PROBABILITY,
      duration: DEFAULT_FAILURE_DURATION
    }
  })

  const [currentTimestamp, setCurrentTimestamp] = useState(() => time)

  const [lightSettings, setLightSettings] = useState([DEFAULT_LIGHT_SETTINGS])

  const failure = new Failure(crossingSettings.failure.duration, crossingSettings.failure.probability)

  const hasFailed = failure.currentState(currentTimestamp)

  const lights = () => lightSettings.map(lightSetting => new TrafficLight(crossingSettings, lightSetting, hasFailed))

  useEffect(() => {
    const clock = new Clock()
    clock.register([...lights(), failure], setCurrentTimestamp)
    return () => {
      clock.unregister();
    };
  });

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
    <div>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Card sx={{ m: 1 }}>
          <CardContent>
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Crossing</h2>
            <form className="">
              <Input label="Cycle length" id="cycle-length" min={10} value={crossingSettings.cycleLength / 1000} onChange={ e => setCrossingSettings({ ...crossingSettings, cycleLength: Number(e.target.value) * 1000 }) } />
              <Input label="Failure duration" id="failure-duration" min={10} value={crossingSettings.failure.duration / 1000} onChange={ e => setCrossingSettings({ ...crossingSettings, failure: { probability: crossingSettings.failure.probability, duration: Number(e.target.value) * 1000 } }) }/>
              <Input label="Failure probability" id="failure-probability" min={0} max={1} step={0.1} value={crossingSettings.failure.probability} onChange={ e => setCrossingSettings({ ...crossingSettings, failure: { duration: crossingSettings.failure.duration, probability: Number(e.target.value) } }) } />
            </form>
          </CardContent>
        </Card>
      </Collapse>
      {/* <div className="flex items-center" style={{ overflowX: "auto" }}> */}
      <Stack direction="row" spacing={2}   justifyContent="center" alignItems="center">
        { lights().map((light, index) =>
          <div key={index}>
            <LightComponent
                index={index}
                currentTimestamp={currentTimestamp}
                light={light}
                lightSettings={lightSettings[index]}
                onLightSettingsChange={(settings: LightSettings) => updateLightSettings(settings, index)}
                onClone={() => onClone(index)}
                onDelete={ lights().length > 1 ? () => onDelete(index) : undefined }
            />
          </div>
        )}
        <div>
          <IconButton aria-label="delete" color="primary" size="large" onClick={() => onClone(lightSettings.length - 1)}>
            <AddIcon fontSize="inherit" />
          </IconButton>
        </div>
      </Stack>
      {/* </div> */}
    </div>
  )
}
