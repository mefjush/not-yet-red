"use client"

import TrafficLight from "../domain/TrafficLight"
import { Stack, Avatar, AvatarProps, Box } from "@mui/material"
import { styled, alpha, Palette, PaletteColor } from "@mui/material/styles"
import { SegmentColor } from "../domain/State"
import LightConfig from "../domain/LightConfig"
import { createElement } from "react"
import { SymbolId, SYMBOLS } from "../domain/Preset"

const TRANSITION_DURATION = "300ms"

const StyledImgAvatar = styled(Avatar)<AvatarProps>(({
  theme,
  color,
  prefix,
  itemType,
}) => {
  let alphaCenter = prefix == "on" && itemType != "black-background" ? 1 : 0.15
  let alphaEdge = prefix == "on" ? 0.2 : 0.05
  let gradientEnd = prefix == "on" ? 80 : 100
  let opacity = prefix == "on" ? 1 : 0.4

  const paletteColor = theme.palette[color as keyof Palette] as PaletteColor
  const backgroundCenter = alpha(paletteColor.main, alphaCenter)
  const backgroundEdge = alpha(paletteColor.dark, alphaEdge)

  return {
    background: `radial-gradient(circle, ${backgroundCenter} 60%, ${backgroundEdge} ${gradientEnd}%)`,
    transitionDuration: TRANSITION_DURATION,
    opacity: opacity,
  }
})

export default function LightHead({
  currentTimestamp,
  light,
  lightConfig,
  maxHeight,
  maxWidth,
  onClick,
}: {
  currentTimestamp: number
  light: TrafficLight
  lightConfig: LightConfig
  maxHeight: number
  maxWidth: number
  onClick?: () => void
}) {
  const segments: SegmentColor[] = lightConfig.preset.colors

  const currentPhase = light.currentPhase(currentTimestamp)

  const segmentSize = 0.6 * Math.round(Math.min(maxHeight / 2.5, maxWidth))
  const unit = "px"

  const isImg = lightConfig.preset.symbolId != SymbolId.NONE
  const symbol = SYMBOLS[lightConfig.preset.symbolId]

  const imgScale = 0.7
  const iconSize = `${imgScale * segmentSize}${unit}`

  const segmentStates = segments.map((segment) => {
    const on = currentPhase.stateAttributes().segments.includes(segment)
    const inverted = symbol.isInverted(segment)

    let icon = <> </>
    if (isImg) {
      icon = createElement(symbol.getIcon(segment), {
        sx: {
          width: iconSize,
          height: iconSize,
          color: inverted ? "black" : `${segment}.main`,
          opacity: on ? 1 : 0.1,
        },
      })
    }

    return (
      <StyledImgAvatar
        prefix={on ? "on" : "off"}
        color={segment}
        key={segment}
        itemType={isImg && !inverted ? "black-background" : "color-background"}
        sx={{
          width: `${segmentSize}${unit}`,
          height: `${segmentSize}${unit}`,
          border: `${0.015 * segmentSize}${unit} solid black`,
        }}
      >
        {icon}
      </StyledImgAvatar>
    )
  })

  return (
    <Box
      sx={{
        py: `${segmentSize * 0.05}${unit}`,
        m: `${segmentSize * 0.05}${unit}`,
      }}
      onClick={onClick}
    >
      <Stack
        direction="column"
        spacing={`${Math.round(segmentSize * 0.03)}${unit}`}
        sx={{
          padding: `${Math.round(segmentSize * 0.2)}${unit}`,
          borderRadius: `${Math.round(segmentSize * 0.3)}${unit}`,
          border: `${0.04 * segmentSize}${unit} solid black`,
          transitionDuration: TRANSITION_DURATION,
          backgroundColor: "#131313",
          boxShadow: 3,
        }}
        justifyContent="center"
        alignItems="center"
      >
        {segmentStates}
      </Stack>
    </Box>
  )
}
