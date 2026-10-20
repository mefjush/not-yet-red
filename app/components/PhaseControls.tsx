"use client"

import { Box, Chip, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import { useState, useRef } from "react"
import { State, TrafficLightColors } from "../domain/State"
import { useLongPress } from "use-long-press"
import LightConfig, { Phase } from "../domain/LightConfig"

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max)

function ColorDot({ color }: { color: TrafficLightColors }) {
  return (
    <Box
      sx={{
        width: 12,
        height: 12,
        borderRadius: "50%",
        bgcolor: `${color}.main`,
        flexShrink: 0,
      }}
    />
  )
}

function DelayedTextField({
  value,
  label,
  onChange,
}: {
  value: number
  label: string
  onChange: (v: number) => void
}) {
  const [lastLegalValue, setLastLegalValue] = useState(value)
  const [uiValue, setUiValue] = useState(value + "")

  if (lastLegalValue != value) {
    setUiValue(value + "")
    setLastLegalValue(value)
  }

  return (
    <TextField
      value={uiValue}
      onChange={(e) => {
        setUiValue(e.target.value)
        const val = Number.parseInt(e.target.value)
        if (!Number.isNaN(val)) {
          onChange(val)
        }
      }}
      size="small"
      type="number"
      slotProps={{
        htmlInput: { "aria-label": `${label} duration in seconds`, inputMode: "numeric" },
        input: { endAdornment: <InputAdornment position="end">s</InputAdornment> },
      }}
      sx={{
        width: 84,
        "& input": { textAlign: "right", MozAppearance: "textfield" },
        "& input::-webkit-inner-spin-button": { WebkitAppearance: "none" },
      }}
    />
  )
}

function PhaseControl({
  max,
  phase,
  onChange,
}: {
  max: number
  phase: Phase
  onChange: (seconds: number) => void
}) {
  const value = phase.duration / 1000
  const { name, color } = phase.stateAttributes()
  const longPressInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const set = (val: number) => onChange(clamp(val, 0, max))

  const stopRepeat = () => {
    if (longPressInterval.current) {
      clearInterval(longPressInterval.current)
      longPressInterval.current = null
    }
  }

  // hold the button to keep changing the value
  const bindInc = useLongPress(
    () => {
      let i = 0
      longPressInterval.current = setInterval(() => set(value + ++i), 50)
    },
    { onFinish: stopRepeat },
  )
  const bindDec = useLongPress(
    () => {
      let i = 0
      longPressInterval.current = setInterval(() => set(value - ++i), 50)
    },
    { onFinish: stopRepeat },
  )

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <ColorDot color={color} />
      <Typography sx={{ flexGrow: 1 }}>{name}</Typography>
      <IconButton {...bindDec()} aria-label={`Shorter ${name}`} onClick={() => set(value - 1)}>
        <RemoveIcon />
      </IconButton>
      <DelayedTextField value={value} label={name} onChange={set} />
      <IconButton {...bindInc()} aria-label={`Longer ${name}`} onClick={() => set(value + 1)}>
        <AddIcon />
      </IconButton>
    </Stack>
  )
}

export function StatePicker({
  phases,
  selectedState,
  setSelectedState,
}: {
  phases: Phase[]
  selectedState?: State
  setSelectedState: (state: State) => void
}) {
  return (
    <Stack
      direction="row"
      role="radiogroup"
      aria-label="Phase to adjust on the timeline"
      sx={{ flexWrap: "wrap", gap: 1 }}
    >
      {phases.map((phase) => {
        const { name, color } = phase.stateAttributes()
        const selected = phase.state == selectedState
        return (
          <Chip
            key={phase.state}
            role="radio"
            aria-checked={selected}
            label={`${name} ${phase.duration / 1000} s`}
            icon={<ColorDot color={color} />}
            color={selected ? color : "default"}
            variant={selected ? "filled" : "outlined"}
            onClick={() => setSelectedState(phase.state)}
            sx={{ pl: 0.5, fontWeight: selected ? 600 : 400 }}
          />
        )
      })}
    </Stack>
  )
}

export default function PhaseControls({
  lightConfig,
  onLightConfigChange,
  setSelectedState,
}: {
  lightConfig: LightConfig
  onLightConfigChange: (lightConfig: LightConfig) => void
  setSelectedState: (state: State) => void
}) {
  return (
    <Stack direction="column" spacing={1}>
      {lightConfig.phases.map((phase) => (
        <PhaseControl
          key={phase.state}
          phase={phase}
          max={lightConfig.cycleLength() / 1000}
          onChange={(seconds) => {
            setSelectedState(phase.state)
            onLightConfigChange(lightConfig.withStateDuration(phase.state, seconds * 1000))
          }}
        />
      ))}
    </Stack>
  )
}
