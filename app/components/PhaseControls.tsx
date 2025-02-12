"use client"

import {
  ButtonGroup,
  Button,
  TextField,
  FormControl,
  RadioGroup,
  Stack,
  FormControlLabel,
  Radio,
} from "@mui/material"
import { useState, useRef, ReactNode } from "react"
import { State, STATE_ATTRIBUTES, TrafficLightColors } from "../domain/State"
import { useLongPress } from "use-long-press"
import LightConfig, { LightSettings } from "../domain/LightConfig"

interface ChangeEvent {
  target: {
    value: number
  }
}

const toEvent = (val: any) => ({ target: { value: Number(val) } })

const fix = (inVal: number, min?: number, max?: number, step?: number) => {
  let outVal: number = inVal
  if (max) {
    outVal = Math.min(inVal, max)
  }
  if (min || min == 0) {
    outVal = Math.max(inVal, min)
  }
  if (step && step < 1) {
    outVal = Math.round(inVal * 100) / 100
  }
  return toEvent(outVal)
}

function DelayedTextField({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const lastLegalValue = useRef(value)
  const [uiValue, setUiValue] = useState(value + "")

  if (lastLegalValue.current != value) {
    setUiValue(value + "")
    lastLegalValue.current = value
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
      variant="outlined"
      size="small"
      type="number"
      slotProps={{
        input: {
          style: {
            borderRadius: 0,
          },
        },
      }}
      sx={{
        "& input": {
          textAlign: "center",
          MozAppearance: "textfield",
        },
        "& input::-webkit-inner-spin-button": {
          WebkitAppearance: "none",
        },
      }}
    />
  )
}

function PhaseControl({
  min,
  max,
  step,
  value,
  color,
  style,
  onChange,
}: {
  min?: number
  max?: number
  step?: number
  value: number
  color: TrafficLightColors
  style?: React.CSSProperties
  onChange: (e: ChangeEvent) => void
}) {
  const [longPressInterval, setLongPressInterval] = useState<NodeJS.Timeout | null>(null)

  const clearLongPressInterval = () => {
    if (longPressInterval) {
      clearInterval(longPressInterval)
    }
  }

  const useLongPressDiff = (diff: number) => {
    return useLongPress(
      (e) => {
        let i = 0
        setLongPressInterval(
          setInterval(() => {
            i += diff
            onChange(fix(value + i, min, max, step))
          }, 50),
        )
      },
      {
        onFinish: clearLongPressInterval,
      },
    )
  }

  const bindInc = useLongPressDiff(1)

  const bindDec = useLongPressDiff(-1)

  return (
    <>
      <ButtonGroup
        fullWidth
        variant="outlined"
        size="small"
        aria-label="Basic button group"
        style={style}
      >
        <Button
          {...bindDec()}
          color={color}
          variant="contained"
          onClick={(e) => onChange(fix(value - 1, min, max, step))}
        >
          -
        </Button>
        <DelayedTextField value={value} onChange={(val) => onChange(fix(val, min, max, step))} />
        <Button
          {...bindInc()}
          color={color}
          variant="contained"
          onClick={(e) => onChange(fix(value + 1, min, max, step))}
        >
          +
        </Button>
      </ButtonGroup>
    </>
  )
}

export function StatePicker({
  states,
  selectedState,
  children,
  setSelectedState,
}: {
  states: State[]
  selectedState?: State
  children?: ReactNode[]
  setSelectedState: (state: State) => void
}) {
  const theChildren = children || []

  const expanded = theChildren.length != 0

  const entries = states.map((state, idx) => {
    const color = STATE_ATTRIBUTES[state].color

    const radio = <Radio size="small" color={`${color}`} sx={{ color: `${color}.main` }} />

    return (
      <Stack direction="row" key={state}>
        <FormControlLabel value={state} control={radio} label="" />
        {theChildren[idx]}
      </Stack>
    )
  })

  return (
    <FormControl fullWidth>
      <RadioGroup
        row={!expanded}
        aria-labelledby="demo-radio-buttons-group-label"
        name="radio-buttons-group"
        value={selectedState}
        onChange={(event) =>
          setSelectedState(State[(event.target as HTMLInputElement).value as keyof typeof State])
        }
      >
        <Stack direction={expanded ? "column" : "row"} spacing={expanded ? 1 : 0}>
          {entries}
        </Stack>
      </RadioGroup>
    </FormControl>
  )
}

export default function PhaseControls({
  lightConfig,
  onLightSettingsChange,
  setSelectedState,
}: {
  lightConfig: LightConfig
  onLightSettingsChange: (lightSettings: LightSettings) => void
  setSelectedState: (state: State) => void
}) {
  const phaseControls = lightConfig.phases.map((phase) => {
    return (
      <PhaseControl
        key={phase.state}
        min={0}
        max={lightConfig.cycleLength() / 1000}
        value={phase.duration / 1000}
        onChange={(e) => {
          setSelectedState(phase.state)
          onLightSettingsChange(lightConfig.withStateDuration(phase.state, e.target.value * 1000))
        }}
        color={phase.stateAttributes().color}
      />
    )
  })

  return (
    <Stack direction="column" spacing={1}>
      {phaseControls}
    </Stack>
  )
}
