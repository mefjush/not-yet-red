"use client"

import TrafficLight from '../domain/traffic-light'
import LightConfig, { LightSettings } from '../domain/light-config'
import { IconButton, Card, CardActions, CardContent, Stack, Box, CardHeader, Avatar, Collapse, Slider, Typography, SlotComponentProps, SliderComponentsPropsOverrides, SliderOwnerState, Checkbox, Tabs, Tab } from '@mui/material'
import Grid from '@mui/material/Grid2'
import DeleteIcon from '@mui/icons-material/Delete'
import ShareIcon from '@mui/icons-material/Share'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useEffect, useRef, useState } from 'react'
import Tune from './tune'
import { CrossingSettingsSerDeser, LightSettingsSerDeser } from '../url'
import { ExpandMore } from './expand-more'
import ShareDialog from './share-dialog'
import PhaseControls from './phase-controls'
import { SegmentColor } from '../domain/state'


export default function LightIcon({ currentTimestamp, light, size, display }: { currentTimestamp: number, light: TrafficLight, size: number, display: 'none' | 'block' }) {

  const segments: SegmentColor[] = ['tlRed', 'tlYellow', 'tlGreen']

  const currentPhase = light.currentPhase(currentTimestamp)

  const segmentStates = segments.map(segment => 
    <Avatar 
      key={segment} 
      sx={{ width: `${size}px`, height: `${size}px`, bgcolor: `${segment}.main`, opacity: currentPhase.stateAttributes().segments.includes(segment) ? 1 : 0.2, transitionDuration: '100ms' }}
    > </Avatar>
  )

  return (
    <Stack direction='column' spacing={'2px'} sx={{ padding: `${Math.round(size * 0.1 + 3)}px`, backgroundColor: 'black', borderRadius: `${Math.round(size * 0.25 + 3)}px`, display: display }}>
      {segmentStates}
    </Stack>
  )
}
