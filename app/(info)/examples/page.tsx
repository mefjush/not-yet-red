"use client"

import { Typography, Button } from "@mui/material"
import LightConfig, { DEFAULT_LIGHT_CONFIG, Phase } from "../../domain/LightConfig"
import { DEFAULT_INTERSECTION_CONFIG } from "../../domain/IntersectionConfig"
import { lightConfigParser } from "../../url"
import { PresetId, PRESETS } from "../../domain/Preset"
import { State } from "../../domain/State"
import DemoScreen from "@/app/components/DemoScreen"
import TrafficLight from "@/app/domain/TrafficLight"
import Grid from "@mui/material/Grid2"
import LightGroups from "@/app/domain/LightGroups"
import { useEffect, useState } from "react"
import Clock from "@/app/domain/Clock"

const HALF_OFFSETTED = DEFAULT_LIGHT_CONFIG.withOffset(DEFAULT_INTERSECTION_CONFIG.cycleLength / 2)

const STATIC_PRESET_BASE = PRESETS[PresetId.FOUR_PHASE]

const alternating = [[DEFAULT_LIGHT_CONFIG], [HALF_OFFSETTED]]

const zebra = [[DEFAULT_LIGHT_CONFIG], [HALF_OFFSETTED.withPreset(PRESETS[PresetId.PEDESTRIAN])]]

const tShaped = [
  [DEFAULT_LIGHT_CONFIG],
  [HALF_OFFSETTED],
  [
    HALF_OFFSETTED.withPreset(PRESETS[PresetId.LEFT]),
    DEFAULT_LIGHT_CONFIG.withPreset(PRESETS[PresetId.RIGHT]),
  ],
]

const staticLight = (state: State) => {
  return DEFAULT_LIGHT_CONFIG.forceWithPhases([
    new Phase(state, 30_000),
    ...STATIC_PRESET_BASE.states.filter((s) => s != state).map((state) => new Phase(state, 0)),
  ])
}

const staticLights = STATIC_PRESET_BASE.states.map((state) => [staticLight(state)])

const toUrl = (lightConfigs: LightConfig[][]) => {
  return (
    "/intersection?lights=" +
    lightConfigs
      .map((lightConfig) => lightConfigParser(DEFAULT_INTERSECTION_CONFIG).serialize(lightConfig))
      .join(",")
  )
}

export default function Examples() {

  const configs = [
    {config: alternating, name: "Alternating traffic"},
    {config: zebra, name: "Zebra crossing"},
    {config: tShaped, name: "T-shaped intersection"},
    {config: staticLights, name: "Static"},
  ]
  
  const lights = configs.map(config => config.config.map(group => group.map(lightConfig => new TrafficLight(lightConfig, false))))
  
  const [currentTimestamp, setCurrentTimestamp] = useState(Date.now())
  
  const clock = new Clock(0)
  
  // after each render
  useEffect(() => {
    clock.register(lights.flatMap(x => x).flatMap(y => y)).then(setCurrentTimestamp)
    return () => {
      clock.unregister()
    }
  })

  const previewWidth = 200

  const listItems = configs.map(({config, name}, configIdx) => (
    <li>
      <Button href={toUrl(config)}>{name}</Button>

      <Grid container sx={{ mb: 5 }} justifyContent='flex-start'>
        {
          config.map((group, groupIdx) => (
            <Grid size={{ xs: 3 }}>
              <DemoScreen 
                width={previewWidth}
                lights={lights[configIdx].flatMap(x => x)}
                lightGroups={new LightGroups(config)}
                currentTimestamp={currentTimestamp}
                fixed={groupIdx}
              />
            </Grid>
          ))
        }
      </Grid>
    </li>
  ))

  return (
    <>
      <Typography variant="h5" sx={{ mt: 2 }}>
        Start with one of pre-made intersections
      </Typography>
      <ul>
        {listItems}
      </ul>

      <Typography variant="h5" sx={{ mt: 2 }}>
        Or...
      </Typography>
      <ul>
        <li>
          <Button href="/intersection">Start from scratch</Button>
        </li>
      </ul>
    </>
  )
}
