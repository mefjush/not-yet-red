"use client"

import { useState } from 'react'


export default function LightComponent({ currentTimestamp, light, lightSettings, onLightSettingsChange }) {

  const [count, setCount] = useState(0)

  return (
    <div>
      <form>
        <label>Red duration</label>
        <input type="number" min={2} value={lightSettings.duration.red / 1000} onChange={e => onLightSettingsChange({ ...lightSettings, duration: { ...lightSettings.duration, red: e.target.value * 1000 } })}/>
      </form>
      <p>You clicked {count} {currentTimestamp} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
      <img src={light.currentPhase(currentTimestamp).state.file}/>
    </div>
  )
}
