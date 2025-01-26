"use client"

import { AppBar, IconButton, Toolbar, Typography, Stack, Paper, Button } from '@mui/material'
import { Suspense } from 'react'
import LightConfig, { DEFAULT_LIGHT_SETTINGS, LightSettings, Phase } from '../domain/LightConfig'
import { DEFAULT_INTERSECTION_SETTINGS } from '../domain/IntersectionSettings'
import { LightSettingsParser } from '../url'
import { PresetId, PRESETS } from '../domain/Preset'
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates'
import { State } from '../domain/State'

const HALF_OFFSETTED = new LightConfig(DEFAULT_INTERSECTION_SETTINGS, DEFAULT_LIGHT_SETTINGS).withOffset(DEFAULT_INTERSECTION_SETTINGS.cycleLength / 2)

const STATIC_PRESET_BASE = PRESETS[PresetId.FOUR_PHASE]

const alternating = [
  DEFAULT_LIGHT_SETTINGS,
  HALF_OFFSETTED
]

const zebra = [
  DEFAULT_LIGHT_SETTINGS,
  new LightConfig(DEFAULT_INTERSECTION_SETTINGS, HALF_OFFSETTED).withPreset(PresetId.PEDESTRIAN)
]

const tShaped = [
  DEFAULT_LIGHT_SETTINGS,
  HALF_OFFSETTED,
  new LightConfig(DEFAULT_INTERSECTION_SETTINGS, HALF_OFFSETTED).withPreset(PresetId.LEFT),
  new LightConfig(DEFAULT_INTERSECTION_SETTINGS, DEFAULT_LIGHT_SETTINGS).withPreset(PresetId.RIGHT)
]

const staticLight = (state: State) => {
  return {
    offset: 0,
    phases: [
      new Phase(state, 30_000),
      ...STATIC_PRESET_BASE.states.filter(s => s != state).map(state => new Phase(state, 0))
    ],
    presetId: STATIC_PRESET_BASE.presetId
  }
}

const staticLights = STATIC_PRESET_BASE.states.map(state => staticLight(state))

const toUrl = (lightSettingsList: LightSettings[]) => {
  return `/intersection?lights=${LightSettingsParser.serialize(lightSettingsList)}`
}

function Content() {

  const toolbarElements = (
    <>
      <Stack direction='row' display={'flex'} sx={{ alignItems: "center" }}>
        <IconButton 
          size="large" 
          edge="start" 
          color='inherit' 
        >
          <TipsAndUpdatesIcon />
        </IconButton>
        <Typography variant="h6" component="div" noWrap>
          Ideas
        </Typography>
      </Stack>
    </>
  )

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          {toolbarElements}
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Paper sx={{ p: 2, m: 2 }}>
        <Typography variant='h5' sx={{ mt: 2 }}>Start with one of pre-made intersections</Typography>
        <ul>
          <li><Button href={toUrl(alternating)}>Alternating traffic</Button></li>
          <li><Button href={toUrl(zebra)}>Zebra crossing</Button></li>
          <li><Button href={toUrl(tShaped) + '&groups=0,1,2%252C3'}>T-shaped intersection</Button></li>
          <li><Button href={toUrl(staticLights)}>Static</Button></li>
        </ul>

        <Typography variant='h5' sx={{ mt: 2 }}>Or <Button sx={{ my: 2 }} href='/intersection'>Make your own</Button></Typography>
        
      </Paper>
    </>
  )
}

export default function Home() {
  return (
    <main>
      <Suspense>
        <Content />
      </Suspense>
    </main>
  )
}
