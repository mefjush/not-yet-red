"use client"

import TrafficLight from "../domain/TrafficLight"
import { Box, Stack } from "@mui/material"
import { alpha, useTheme, PaletteColor } from "@mui/material/styles"
import { SegmentColor } from "../domain/State"
import LightConfig from "../domain/LightConfig"
import { createElement } from "react"
import { PresetId, SymbolId, SYMBOLS } from "../domain/Preset"

const TRANSITION = "opacity 250ms ease-out, filter 250ms ease-out"

// small glass reflection, drawn on top of every lens
const HIGHLIGHT = "radial-gradient(ellipse 34% 20% at 36% 24%, rgba(255,255,255,0.16), transparent)"

function Lamp({
  size,
  color,
  on,
  flashing,
  halfBeat,
  icon,
  litDisc,
  inverted,
}: {
  size: number
  color: PaletteColor
  on: boolean
  flashing: boolean
  // flash half a beat later than the neighbour, for alternating lamps
  halfBeat: boolean
  icon?: React.ElementType
  // false: the lens stays black and only the symbol lights up (green arrows, pedestrians)
  litDisc: boolean
  inverted: boolean
}) {
  const px = (fraction: number) => `${fraction * size}px`
  const blink = on && flashing ? "tl-flashing" : undefined
  const blinkDelay = blink && halfBeat ? { animationDelay: "-0.5s" } : undefined

  // tinted glass when off, so a dark lamp still reads as red, yellow or green
  const offLens = `radial-gradient(circle at 50% 40%, ${alpha(color.main, 0.28)} 0%, ${alpha(color.dark, 0.22)} 45%, #070707 100%)`
  // LEDs shine evenly, a bit stronger in the middle
  const onLens = `radial-gradient(circle at 50% 45%, ${color.light} 0%, ${color.main} 55%, ${color.dark} 100%)`
  // LED dots, only where they are big enough to see
  const ledDots =
    size >= 60
      ? `radial-gradient(circle, rgba(0,0,0,0.3) 30%, transparent 36%) center / ${px(0.085)} ${px(0.085)}, `
      : ""

  return (
    <Box sx={{ position: "relative", width: px(1), height: px(1), flexShrink: 0 }}>
      {/* lens */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: `${px(0.04)} solid #050505`,
          background: litDisc ? offLens : "#070707",
          overflow: "hidden",
        }}
      >
        {litDisc && (
          <Box
            className={blink}
            style={blinkDelay}
            sx={{
              position: "absolute",
              inset: 0,
              // first layer is drawn on top
              background: ledDots + onLens,
              opacity: on ? 1 : 0,
              transition: TRANSITION,
            }}
          />
        )}
        {icon &&
          createElement(icon, {
            className: blink,
            style: {
              "--tl-off-opacity": inverted ? 0.55 : 0.12,
              ...blinkDelay,
            } as React.CSSProperties,
            sx: {
              position: "absolute",
              inset: "15%",
              width: "70%",
              height: "70%",
              color: inverted ? "#050505" : color.main,
              opacity: on ? 1 : inverted ? 0.55 : 0.12,
              filter: on && !inverted ? `drop-shadow(0 0 ${px(0.08)} ${color.main})` : "none",
              transition: TRANSITION,
            },
          })}
        {/* shadow cast by the visor on the top of the lens */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: `linear-gradient(to bottom, rgba(0,0,0,0.55), transparent 32%), ${HIGHLIGHT}`,
          }}
        />
      </Box>

      {/* glow spilling past the lens */}
      {litDisc && (
        <Box
          className={blink}
          style={blinkDelay}
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            boxShadow: `0 0 ${px(0.35)} ${px(0.04)} ${alpha(color.main, 0.5)}`,
            opacity: on ? 1 : 0,
            transition: TRANSITION,
            pointerEvents: "none",
          }}
        />
      )}

      {/* visor: the hood above the lamp, seen from the front as an arc */}
      <Box
        sx={{
          position: "absolute",
          inset: px(-0.1),
          borderRadius: "50%",
          border: `${px(0.1)} solid transparent`,
          borderTopColor: "#2b2b2b",
          pointerEvents: "none",
        }}
      />
    </Box>
  )
}

export default function LightHead({
  currentTimestamp,
  light,
  lightConfig,
  maxHeight,
  maxWidth,
}: {
  currentTimestamp: number
  light: TrafficLight
  lightConfig: LightConfig
  maxHeight: number
  maxWidth: number
}) {
  const theme = useTheme()
  const segments: SegmentColor[] = lightConfig.preset.colors

  const currentPhase = light.currentPhase(currentTimestamp)

  const { horizontal, presetId } = lightConfig.preset
  const size = 0.6 * Math.round(Math.min(maxHeight / 2.5, horizontal ? maxWidth / 2.5 : maxWidth))
  const px = (fraction: number) => `${fraction * size}px`

  const isImg = lightConfig.preset.symbolId != SymbolId.NONE
  const symbol = SYMBOLS[lightConfig.preset.symbolId]

  return (
    <Box
      sx={{
        py: px(0.05),
        m: px(0.05),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* the cross sits above the lights on the post */}
      {/* a bit wider than the housing (about 2.6 lamps), like on a real post */}
      {presetId == PresetId.RAILWAY && <RailwayCross width={size * 3.9} />}
      <Stack
        direction={horizontal ? "row" : "column"}
        sx={{
          gap: px(0.16),
          px: px(0.2),
          pt: px(0.24),
          pb: px(0.2),
          borderRadius: px(0.24),
          border: `${px(0.03)} solid #000`,
          // shaded like a moulded body: lighter in the middle, darker at the edges
          background: "linear-gradient(90deg, #121212 0%, #262626 42%, #1d1d1d 58%, #0f0f0f 100%)",
          boxShadow: `0 ${px(0.06)} ${px(0.2)} rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)`,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {segments.map((segment, idx) => {
          const inverted = symbol.isInverted(segment)
          const attributes = currentPhase.stateAttributes()
          return (
            <Lamp
              key={idx}
              size={size}
              color={symbol.white ? theme.palette.tlWhite : theme.palette[segment]}
              on={attributes.segments.includes(segment)}
              flashing={attributes.flashing ?? false}
              halfBeat={(attributes.alternating ?? false) && idx % 2 == 1}
              icon={isImg ? symbol.getIcon(segment) : undefined}
              litDisc={!isImg || inverted}
              inverted={inverted}
            />
          )
        })}
      </Stack>
    </Box>
  )
}

// St Andrew's cross: the red and white X above a railway crossing signal
function RailwayCross({ width }: { width: number }) {
  const board = (angle: number) => (
    <g transform={`rotate(${angle} 50 30)`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={4 + i * 18.4}
          y={25}
          width={18.4}
          height={10}
          fill={i % 2 ? "#ffffff" : "#d32f2f"}
        />
      ))}
      <rect x={4} y={25} width={92} height={10} fill="none" stroke="#7a1010" strokeWidth={1} />
    </g>
  )
  return (
    <svg
      viewBox="0 0 100 60"
      width={width}
      height={width * 0.6}
      aria-hidden
      style={{ marginBottom: width * 0.06 }}
    >
      {board(31)}
      {board(-31)}
    </svg>
  )
}
