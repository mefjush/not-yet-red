"use client"

import { Typography, Button } from "@mui/material"
import LightConfig, { DEFAULT_LIGHT_CONFIG, Phase } from "../../domain/LightConfig"
import { DEFAULT_INTERSECTION_CONFIG } from "../../domain/IntersectionConfig"
import { lightConfigParser } from "../../url"
import { PresetId, PRESETS } from "../../domain/Preset"
import { State } from "../../domain/State"

const HALF_OFFSETTED = DEFAULT_LIGHT_CONFIG.withOffset(DEFAULT_INTERSECTION_CONFIG.cycleLength / 2)

const STATIC_PRESET_BASE = PRESETS[PresetId.FOUR_PHASE]

const alternating = [DEFAULT_LIGHT_CONFIG, HALF_OFFSETTED]

const zebra = [DEFAULT_LIGHT_CONFIG, HALF_OFFSETTED.withPreset(PRESETS[PresetId.PEDESTRIAN])]

const tShaped = [
  DEFAULT_LIGHT_CONFIG,
  HALF_OFFSETTED,
  HALF_OFFSETTED.withPreset(PRESETS[PresetId.LEFT]),
  DEFAULT_LIGHT_CONFIG.withPreset(PRESETS[PresetId.RIGHT]),
]

const staticLight = (state: State) => {
  return DEFAULT_LIGHT_CONFIG.forceWithPhases([
    new Phase(state, 30_000),
    ...STATIC_PRESET_BASE.states.filter((s) => s != state).map((state) => new Phase(state, 0)),
  ])
}

const staticLights = STATIC_PRESET_BASE.states.map((state) => staticLight(state))

const toUrl = (lightConfigs: LightConfig[]) => {
  return `/intersection?lights=${lightConfigParser(DEFAULT_INTERSECTION_CONFIG).serialize(lightConfigs)}`
}

export default function Ideas() {
  return (
    <>
      <Typography variant="h5" sx={{ mt: 2 }}>
        Start with one of pre-made intersections
      </Typography>
      <ul>
        <li>
          <Button href={toUrl(alternating)}>Alternating traffic</Button>
        </li>
        <li>
          <Button href={toUrl(zebra)}>Zebra crossing</Button>
        </li>
        <li>
          <Button href={toUrl(tShaped) + "&groups=0,1,2%252C3"}>T-shaped intersection</Button>
        </li>
        <li>
          <Button href={toUrl(staticLights)}>Static</Button>
        </li>
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
