"use client"

import { AppBar, IconButton, Toolbar, Typography, Stack, Paper, Button } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import HomeIcon from '@mui/icons-material/Home'
import { Suspense } from 'react'
import LightConfig, { DEFAULT_LIGHT_SETTINGS, LightSettings } from './domain/LightConfig'
import { DEFAULT_INTERSECTION_SETTINGS } from './domain/IntersectionSettings'
import { LightSettingsParser } from './url'
import { PresetId } from './domain/Preset'

const HALF_OFFSETTED = new LightConfig(DEFAULT_INTERSECTION_SETTINGS, DEFAULT_LIGHT_SETTINGS).withOffset(DEFAULT_INTERSECTION_SETTINGS.cycleLength / 2)

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
          <HomeIcon />
        </IconButton>
        <Typography variant="h6" component="div" noWrap>
          Traffic Lights
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
        <Typography variant='h3'>Welcome to <strong>Traffic Lights</strong>!</Typography>

        <p>Traffic Lights lets you design your own intersections using smartphones as traffic lights, turning any space into your very own traffic system. Perfect for kids, this app makes learning about road safety and traffic rules exciting and hands-on.</p>
        <p>Key Features:</p>
        <ul>
          <li><strong>Create Your Own Intersection:</strong> Arrange streets and place traffic lights anywhere in your environment, using your smartphones to control the lights with simple, intuitive controls.</li>
          <li><strong>Learn Through Play:</strong> Teach kids about the importance of traffic lights, road signs, and safe driving habits while having fun.</li>
          <li><strong>Matchbox Car Adventures:</strong> Build mini streets and race tracks for matchbox cars, letting your toys zip through intersections and obey traffic signals just like in real life.</li>
          <li><strong>Interactive Traffic Signals:</strong> Control traffic flow by changing the color of traffic lights, simulating real-world traffic scenarios.</li>
          <li><strong>Educational Gameplay:</strong> Perfect for young learners, the app turns every street corner into an opportunity for exploring the world of traffic safety and urban planning.</li>
        </ul>
        <p>Whether you're building roads for your toy cars, helping kids understand traffic rules, or simply having fun with a digital model of your own intersection, <strong>Traffic Lights</strong> makes it all possible.</p>
        
        <Button sx={{ my: 2 }} href='/intersection' variant="contained" endIcon={<PlayArrowIcon />}>Build your own intersection</Button>

        <Typography variant='h4' sx={{ mt: 2 }}>Example Intersections</Typography>
        <ul>
          <li><Button href={toUrl(alternating)}>Alternating traffic</Button></li>
          <li><Button href={toUrl(zebra)}>Zebra crossing</Button></li>
          <li><Button href={toUrl(tShaped)}>T-shaped intersection</Button></li>
        </ul>
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
