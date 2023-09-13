"use client"

import { useState, useEffect } from 'react'
import LightComponent from './light'
import Clock from './clock'
import TrafficLight from './trafficLight'

const DEFAULT_FAILURE_DURATION = 10000;
const DEFAULT_FAILURE_PROBABILITY = 0.1;


export default function CrossingComponent({time}) {

  const [crossingSettings, setCrossingSettings] = useState({
    failure: {
      probability: DEFAULT_FAILURE_PROBABILITY,
      duration: DEFAULT_FAILURE_DURATION
    }
  })

  const [currentTimestamp, setCurrentTimestamp] = useState(() => time)

  const [lights, setLights] = useState([new TrafficLight()])

  useEffect(() => {
    const clock = new Clock()
    clock.register(lights, setCurrentTimestamp)
    return () => {
      clock.unregister();
    };
  });

  const addLight = () => {
    setLights([...lights, new TrafficLight()])
  }

  return (
    <div>
      <button onClick={() => addLight()}>Add light</button>
      { lights.map((light, index) => <LightComponent key={index} currentTimestamp={currentTimestamp} light={light} />)}
    </div>
  )
}
