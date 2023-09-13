"use client"

import { useState } from 'react'


export default function LightComponent({ currentTimestamp, light }) {

  const [count, setCount] = useState(0)

  return (
    <div>
      <p>You clicked {count} {currentTimestamp} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
      <img src={light.currentPhase(currentTimestamp).state.file}/>
    </div>
  )
}


