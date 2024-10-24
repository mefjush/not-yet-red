"use client"

import { Slider, Input as MuiInput, Stack, ButtonGroup, Button, Dialog, DialogTitle, DialogContent } from '@mui/material'
import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid2'
import { KeyboardEvent, FocusEvent, useState } from 'react'
import { TrafficLightColors } from '../domain/state'
import { useLongPress } from 'use-long-press';

const MInput = styled(MuiInput)`
  width: 50px
`

interface ChangeEvent {
  target: {
    value: number
  }
}

const toEvent = (val: any) => ({ target: { value: Number(val) }})

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

function PhaseSlider({id, label, min, max, step, value, onChange, color}: {id: string, label: string, min?: number, max?: number, step?: number, value: number, onChange: ((e: ChangeEvent) => void), color: TrafficLightColors}) {

  const [tempValue, setTempValue] = useState<string|null>(null)

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    onChange(fix(newValue as number, min, max, step))
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTempValue(event.target.value)
  }

  const handleOnBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (tempValue != null) {
      onChange(fix(Number.parseInt(tempValue || ''), min, max, step))
      setTempValue(null)
    }
  }

  const handleOnKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur()
    }
  }

  return (
    <Stack direction="row" spacing={2}>
      <Slider
        color={color}
        value={typeof value === 'number' ? value : 0}
        step={step || 1}
        min={min}
        max={max}
        onChange={handleSliderChange}
        aria-labelledby={id}
      />
      <MInput
        value={tempValue != null ? tempValue : value}
        size="small"
        onChange={handleInputChange}
        onKeyDown={handleOnKeyDown}
        onBlur={handleOnBlur}
        inputProps={{
          step: (step || 1),
          min: min,
          max: max,
          type: 'number',
          'aria-labelledby': id
        }}
      />
    </Stack>
  )
}

export default function PhaseControls({id, label, min, max, step, value, onChange, color}: {id: string, label: string, min?: number, max?: number, step?: number, value: number, onChange: ((e: ChangeEvent) => void), color: TrafficLightColors}) {
  
  const [open, setOpen] = useState(false)
  const [longPressInterval, setLongPressInterval] = useState<NodeJS.Timeout|null>(null)
  
  const clearLongPressInterval = () => {
    if (longPressInterval) {
      clearInterval(longPressInterval)
    }
  }

  const useLongPressDiff = (diff: number) => {
    return useLongPress(e => {
      let i = 0
      setLongPressInterval(setInterval(() => { 
        i += diff
        onChange(fix(value + i, min, max, step))
      }, 50))
    }, {
      onFinish: clearLongPressInterval
    })
  }

  const bindInc = useLongPressDiff(1)

  const bindDec = useLongPressDiff(-1)

  return (
    <Grid container spacing={2} sx={{ my: 1 }}>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <ButtonGroup variant="outlined" aria-label="Basic button group" fullWidth>
          <Button {...bindDec()} color={color} variant='contained' onClick={e => onChange(fix(value - 1, min, max, step))}>-</Button>
          <Button color={color} variant='outlined' onClick={e => setOpen(true)}>{value}</Button>
          <Button {...bindInc()} color={color} variant='contained' onClick={e => onChange(fix(value + 1, min, max, step))}>+</Button>
        </ButtonGroup>
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 8 }} display={{ xs: 'none', md: 'block' }}>
        <PhaseSlider id={id} label={label} min={min} max={max} step={step} value={value} onChange={onChange} color={color}/>
      </Grid>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
      >
        <DialogTitle>Set {label}</DialogTitle>
        <DialogContent>
          <Stack direction="column" spacing={1}>
            <PhaseSlider id={id} label={label} min={min} max={max} step={step} value={value} onChange={onChange} color={color} />
            <Button onClick={e => setOpen(false)}>OK</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Grid>
  )
}
