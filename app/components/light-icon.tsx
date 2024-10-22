"use client"

import TrafficLight from '../domain/traffic-light'
import { Stack, Avatar } from '@mui/material'
import { SegmentColor } from '../domain/state'


export default function LightIcon({ currentTimestamp, light, size }: { currentTimestamp: number, light: TrafficLight, size: number }) {

  const segments: SegmentColor[] = ['tlRed', 'tlYellow', 'tlGreen']

  const currentPhase = light.currentPhase(currentTimestamp)

  const segmentStates = segments.map(segment => 
    <Avatar 
      key={segment} 
      sx={{ width: `${size}px`, height: `${size}px`, bgcolor: `${segment}.main`, opacity: currentPhase.stateAttributes().segments.includes(segment) ? 1 : 0.2, transitionDuration: '100ms' }}
    > </Avatar>
  )

  return (
    <Stack direction='column' spacing={'2px'} sx={{ padding: `${Math.round(size * 0.1 + 3)}px`, backgroundColor: 'black', borderRadius: `${Math.round(size * 0.25 + 3)}px` }}>
      {segmentStates}
    </Stack>
  )
}
