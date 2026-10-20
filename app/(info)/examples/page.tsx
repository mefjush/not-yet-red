"use client"

import {
  Typography,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  CardActions,
  Grid,
} from "@mui/material"
import LightConfig, { DEFAULT_LIGHT_CONFIG, Phase } from "../../domain/LightConfig"
import { DEFAULT_INTERSECTION_CONFIG } from "../../domain/IntersectionConfig"
import { lightConfigParser } from "../../url"
import { PresetId, PRESETS } from "../../domain/Preset"
import { State } from "../../domain/State"
import DemoScreen from "@/app/components/DemoScreen"
import TrafficLight from "@/app/domain/TrafficLight"
import LightGroups from "@/app/domain/LightGroups"
import { useEffect, useState } from "react"
import Clock from "@/app/domain/Clock"
import useHydrated from "@/app/hooks/useHydrated"

const HALF_OFFSETTED = DEFAULT_LIGHT_CONFIG.withOffset(DEFAULT_INTERSECTION_CONFIG.cycleLength / 2)

const STATIC_PRESET_BASE = PRESETS[PresetId.FOUR_PHASE]

const justOne = [[DEFAULT_LIGHT_CONFIG]]

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
    {
      config: justOne,
      name: "Just one light",
      scenarios: ["Make your toy cars follow the traffic light."],
    },
    {
      config: alternating,
      name: "Alternating traffic",
      scenarios: [
        "Put a large box in a corridor, place the traffic lights on the opposite sides of the narrowing.",
      ],
    },
    {
      config: zebra,
      name: "Zebra crossing",
      scenarios: [
        "Divide your household into 'pedestrians' and 'cars', make sure both groups obey the law.",
      ],
    },
    {
      config: tShaped,
      name: "T-shaped intersection",
      scenarios: [
        "Find a t-shaped alleys in a park. Install the traffic lights. Make sure no bicycle runs the red light.",
      ],
    },
    {
      config: staticLights,
      name: "Static",
      scenarios: ["Enter the fullscreen mode. Swipe left and right to 'control' the lights."],
    },
    { config: [], name: "Empty", scenarios: ["Start from scratch!"] },
  ]

  const lights = configs.map((config) =>
    config.config.flatMap((group) =>
      group.map((lightConfig) => new TrafficLight(lightConfig, false)),
    ),
  )

  const clock = new Clock(0)

  const [timestamp, setCurrentTimestamp] = useState(() => clock.now())
  const currentTimestamp = useHydrated() ? timestamp : 0

  // after each render
  useEffect(() => {
    clock.register(lights.flatMap((x) => x)).then(setCurrentTimestamp)
    return () => {
      clock.unregister()
    }
  })

  const previewWidth = 90

  const listItems = configs.map(({ config, name, scenarios }, configIdx) => (
    <Card key={configIdx}>
      <CardContent>
        <Typography variant="h6" component="h2">
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {scenarios}
        </Typography>

        <Grid sx={{ mt: 2 }} container spacing={1}>
          {config.map((group, groupIdx) => (
            <Grid size={{ xs: 6, md: 3, lg: 2 }} key={groupIdx}>
              <DemoScreen
                width={previewWidth}
                lights={lights[configIdx].flatMap((x) => x)}
                lightGroups={new LightGroups(config)}
                currentTimestamp={currentTimestamp}
                fixed={groupIdx}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button variant="contained" href={toUrl(config)}>
          Use this setup
        </Button>
      </CardActions>
    </Card>
  ))

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Stack spacing={2}>{listItems}</Stack>
    </Container>
  )
}
