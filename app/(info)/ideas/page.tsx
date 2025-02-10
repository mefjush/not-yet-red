"use client"

import { Typography, Button } from "@mui/material"
import LightConfig, {
  DEFAULT_LIGHT_SETTINGS,
  LightSettings,
  Phase,
} from "../../domain/LightConfig"
import { DEFAULT_INTERSECTION_SETTINGS } from "../../domain/IntersectionSettings"
import { LightSettingsParser } from "../../url"
import { PresetId, PRESETS } from "../../domain/Preset"
import { State } from "../../domain/State"

const HALF_OFFSETTED = new LightConfig(
  DEFAULT_INTERSECTION_SETTINGS,
  DEFAULT_LIGHT_SETTINGS,
).withOffset(DEFAULT_INTERSECTION_SETTINGS.cycleLength / 2)

const STATIC_PRESET_BASE = PRESETS[PresetId.FOUR_PHASE]

const alternating = [DEFAULT_LIGHT_SETTINGS, HALF_OFFSETTED]

const zebra = [
  DEFAULT_LIGHT_SETTINGS,
  new LightConfig(DEFAULT_INTERSECTION_SETTINGS, HALF_OFFSETTED).withPreset(
    PresetId.PEDESTRIAN,
  ),
]

const tShaped = [
  DEFAULT_LIGHT_SETTINGS,
  HALF_OFFSETTED,
  new LightConfig(DEFAULT_INTERSECTION_SETTINGS, HALF_OFFSETTED).withPreset(
    PresetId.LEFT,
  ),
  new LightConfig(
    DEFAULT_INTERSECTION_SETTINGS,
    DEFAULT_LIGHT_SETTINGS,
  ).withPreset(PresetId.RIGHT),
]

const staticLight = (state: State) => {
  return {
    offset: 0,
    phases: [
      new Phase(state, 30_000),
      ...STATIC_PRESET_BASE.states
        .filter((s) => s != state)
        .map((state) => new Phase(state, 0)),
    ],
    presetId: STATIC_PRESET_BASE.presetId,
  }
}

const staticLights = STATIC_PRESET_BASE.states.map((state) =>
  staticLight(state),
)

const toUrl = (lightSettingsList: LightSettings[]) => {
  return `/intersection?lights=${LightSettingsParser.serialize(lightSettingsList)}`
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
          <Button href={toUrl(tShaped) + "&groups=0,1,2%252C3"}>
            T-shaped intersection
          </Button>
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
