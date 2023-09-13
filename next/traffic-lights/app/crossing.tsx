"use client"

import { useState, useEffect } from 'react'
import LightComponent from './light'
import Clock from './clock'
import TrafficLight from './trafficLight'

const DEFAULT_FAILURE_DURATION = 10000
const DEFAULT_FAILURE_PROBABILITY = 0.1
const DEFAULT_CYCLE_LENGTH = 60000

export default function CrossingComponent({time, replaceLight}) {

  const DEFAULT_LIGHT_SETTINGS = { duration: { red: 30000 } };

  const [crossingSettings, setCrossingSettings] = useState({
    cycleLength: DEFAULT_CYCLE_LENGTH,
    failure: {
      probability: DEFAULT_FAILURE_PROBABILITY,
      duration: DEFAULT_FAILURE_DURATION
    }
  })

  const [currentTimestamp, setCurrentTimestamp] = useState(() => time)

  const [lightSettings, setLightSettings] = useState([DEFAULT_LIGHT_SETTINGS])

  const lights = () => lightSettings.map(lightSetting => new TrafficLight(crossingSettings, lightSetting))

  useEffect(() => {
    const clock = new Clock()
    clock.register(lights(), setCurrentTimestamp)
    return () => {
      clock.unregister();
    };
  });

  const addLight = () => {
    setLightSettings([...lightSettings, DEFAULT_LIGHT_SETTINGS])
  }

  const updateLightSettings = (settings, index) => {
    const copy = [...lightSettings]
    copy.splice(index, 1, settings)
    setLightSettings(copy)
  }

  return (
    <div>
      <form>
        <label htmlFor="cycle-length">Cycle length</label>
        <input type="number" name="cycle-length" min={10} value={crossingSettings.cycleLength / 1000} onChange={ e => setCrossingSettings({ ...crossingSettings, cycleLength: e.target.value * 1000 }) }/>
      </form>
      <button onClick={() => addLight()}>Add light</button>
      { lights().map((light, index) => <LightComponent key={index} currentTimestamp={currentTimestamp} light={light} lightSettings={lightSettings[index]} onLightSettingsChange={settings => updateLightSettings(settings, index)} />)}
    </div>
  )
}
