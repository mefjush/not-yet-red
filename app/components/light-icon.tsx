"use client"

import TrafficLight from '../domain/traffic-light'
import { Stack, Avatar, AvatarProps } from '@mui/material'
import { styled, alpha, Palette, PaletteColor } from "@mui/material/styles"
import { SegmentColor } from '../domain/state'

const TRANSITION_DURATION = '300ms'

const StyledAvatar = styled(Avatar)<AvatarProps>(
  ({ theme, color, prefix }) => {
    const alphaCenter = prefix == 'on' ? 1 : 0.3
    const alphaEdge = prefix == 'on' ? 0 : 0.05
    const gradientEnd = prefix == 'on' ? 80 : 100
    const opacity = prefix == 'on' ? 1 : 0.5

    const paletteColor = (theme.palette[color as keyof Palette]) as PaletteColor
    const backgroundCenter = alpha(paletteColor.main, alphaCenter)
    const backgroundEdge = alpha(paletteColor.dark, alphaEdge)

    return {
      background: `radial-gradient(circle, ${backgroundCenter} 50%, ${backgroundEdge} ${gradientEnd}%)`,
      transitionDuration: TRANSITION_DURATION,
      opacity: opacity
    }
  }
)

export default function LightIcon({ currentTimestamp, light, height }: { currentTimestamp: number, light: TrafficLight, height: string }) {

  const segments: SegmentColor[] = ['tlRed', 'tlYellow', 'tlGreen']

  const currentPhase = light.currentPhase(currentTimestamp)

  const segmentSize = Number.parseInt(height.substring(0, height.length - 2)) / ((segments.length) * 1.05)
  const segmentSizeUnit = height.substring(height.length - 2, height.length)

  const segmentStates = segments.map(segment => 
    <StyledAvatar 
      prefix={currentPhase.stateAttributes().segments.includes(segment) ? 'on' : 'off'} 
      color={segment}
      key={segment} 
      sx={{ width: `${segmentSize}${segmentSizeUnit}`, height: `${segmentSize}${segmentSizeUnit}` }}
    > </StyledAvatar>
  )

  return (
    <Stack 
      direction='column' 
      spacing={'2px'} 
      height={height}
      sx={{ padding: `${Math.round(segmentSize * 0.2)}${segmentSizeUnit}`, backgroundColor: 'black', borderRadius: `${Math.round(segmentSize * 0.35)}${segmentSizeUnit}`, transitionDuration: TRANSITION_DURATION }}
    >
      {segmentStates}
    </Stack>
  )
}
