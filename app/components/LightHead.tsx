"use client"

import TrafficLight from '../domain/TrafficLight'
import { Stack, Avatar, AvatarProps, Box } from '@mui/material'
import { styled, alpha, Palette, PaletteColor } from "@mui/material/styles"
import { SegmentColor } from '../domain/State'
import LightConfig from '../domain/LightConfig'
import { createElement } from 'react'
import { SymbolId, SYMBOLS } from '../domain/Preset'

const TRANSITION_DURATION = '300ms'

const StyledImgAvatar = styled(Avatar)<AvatarProps>(
  ({ theme, color, prefix, itemType }) => {
    let alphaCenter = prefix == 'on' && itemType != 'black-background' ? 1 : 0.15
    let alphaEdge = prefix == 'on' ? 0.2 : 0.05
    let gradientEnd = prefix == 'on' ? 80 : 100
    let opacity = prefix == 'on' ? 1 : 0.4

    const paletteColor = (theme.palette[color as keyof Palette]) as PaletteColor
    const backgroundCenter = alpha(paletteColor.main, alphaCenter)
    const backgroundEdge = alpha(paletteColor.dark, alphaEdge)

    return {
      background: `radial-gradient(circle, ${backgroundCenter} 60%, ${backgroundEdge} ${gradientEnd}%)`,
      transitionDuration: TRANSITION_DURATION,
      opacity: opacity
    }
  }
)

export default function LightHead({ currentTimestamp, light, lightConfig, height }: { currentTimestamp: number, light: TrafficLight, lightConfig: LightConfig, height: string }) {

  const segments: SegmentColor[] = lightConfig.preset.colors

  const currentPhase = light.currentPhase(currentTimestamp)

  const heightValue = Number.parseInt(height.substring(0, height.length - 2))
  const heightUnit = height.substring(height.length - 2, height.length)
  const segmentSize = 0.8 * heightValue / 3

  const isImg = lightConfig.preset.symbolId != SymbolId.NONE
  const symbol = SYMBOLS[lightConfig.preset.symbolId]

  const imgScale = 0.7
  const iconSize = `${imgScale * segmentSize}${heightUnit}`

  const segmentStates = segments.map(segment => {

    const on = currentPhase.stateAttributes().segments.includes(segment)
    const inverted = symbol.isInverted(segment)

    let icon = <> </>
    if (isImg) {
      icon = createElement(symbol.getIcon(segment), { 
        sx: { 
          width: iconSize, 
          height: iconSize, 
          color: inverted ? 'black' : `${segment}.main`, 
          opacity: on ? 1 : 0.1 
        }
      })
    }

    return (
      <StyledImgAvatar 
        prefix={on ? 'on' : 'off'} 
        color={segment}
        key={segment}
        itemType={ isImg && !inverted ? 'black-background' : 'color-background' }
        sx={{
          width: `${segmentSize}${heightUnit}`, 
          height: `${segmentSize}${heightUnit}`,
          border: `${0.015 * segmentSize}${heightUnit} solid black`
        }}
      >
        {icon}
      </StyledImgAvatar>
    )
  })

  return (
    <Box sx={{ py: 2 }}>
      <Stack 
        direction='column' 
        spacing={`${Math.round(heightValue * 0.01)}${heightUnit}`} 
        sx={{ 
          padding: `${Math.round(heightValue * 0.06)}${heightUnit}`, 
          borderRadius: `${Math.round(heightValue * 0.1)}${heightUnit}`, 
          border: `${0.015 * segmentSize}${heightUnit} solid black`,
          transitionDuration: TRANSITION_DURATION,
          backgroundColor: '#131313',
          boxShadow: 3
        }}
        justifyContent="center"
        alignItems="center"
      >
        {segmentStates}
      </Stack>
    </Box>
  )
}
