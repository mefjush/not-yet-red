"use client"

import { useState, useEffect } from 'react'
import LightComponent from './light'
import Clock from './clock'
import TrafficLight from './trafficLight'
import Failure from './failure'
import Input from './input'

const DEFAULT_FAILURE_DURATION = 10000
const DEFAULT_FAILURE_PROBABILITY = 0.1
const DEFAULT_CYCLE_LENGTH = 60000

export default function CrossingComponent({time, replaceLight}) {

  const DEFAULT_LIGHT_SETTINGS = { offset: 0, duration: { red: 30000 } };

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

  const updateLightSettings = (settings, index) => {
    const copy = [...lightSettings]
    copy.splice(index, 1, settings)
    setLightSettings(copy)
  }

  const onClone = (index) => {
    const copy = [...lightSettings]
    copy.splice(index + 1, 0, lightSettings[index])
    setLightSettings(copy)
  }

  const onDelete = (index) => {
    const copy = [...lightSettings]
    copy.splice(index, 1)
    setLightSettings(copy)
  }


  return (
    <div>
      <h1 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Crossing</h1>
      <form className="space-y-4">
        <Input label="Cycle length" id="cycle-length" min={10} value={crossingSettings.cycleLength / 1000} onChange={ e => setCrossingSettings({ ...crossingSettings, cycleLength: e.target.value * 1000 }) } />
        <Input label="Failure duration" id="failure-duration" min={10} value={crossingSettings.failure.duration / 1000} onChange={ e => setCrossingSettings({ ...crossingSettings, failure: { probability: crossingSettings.failure.probability, duration: e.target.value * 1000 } }) }/>
        <Input label="Failure probability" id="failure-probability" min={0} max={1} step={0.1} value={crossingSettings.failure.probability} onChange={ e => setCrossingSettings({ ...crossingSettings, failure: { duration: crossingSettings.failure.duration, probability: e.target.value } }) } />
      </form>
      { lights().map((light, index) =>
        <LightComponent
            key={index}
            index={index}
            currentTimestamp={currentTimestamp}
            light={light}
            lightSettings={lightSettings[index]}
            onLightSettingsChange={settings => updateLightSettings(settings, index)}
            onClone={() => onClone(index)}
            onDelete={ lights().length > 1 ? () => onDelete(index) : null }
        />
      )}
    </div>
  )
}
