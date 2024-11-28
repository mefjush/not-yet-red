"use client"

import { ButtonGroup, Button, TextField } from '@mui/material'
import { useState, useRef } from 'react'
import { TrafficLightColors } from '../domain/state'
import { useLongPress } from 'use-long-press'

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

function DelayedTextField({value, onChange}: {value: number, onChange: ((v: number) => void)}) {

  const lastLegalValue = useRef(value)
  const [uiValue, setUiValue] = useState(value + '')

  if (lastLegalValue.current != value) {
    setUiValue(value + '')
    lastLegalValue.current = value
  }

  return (
    <TextField
      value={uiValue}
      onChange={e => {
        setUiValue(e.target.value)
        const val = Number.parseInt(e.target.value)
        if (!Number.isNaN(val)) {
          onChange(val)
        }
      }}
      variant="outlined" 
      size='small' 
      type="number"
      slotProps={{
        input: {
          style: {
            WebkitAppearance: 'none', 
            MozAppearance: 'textfield',
            borderRadius: 0,
            textAlign: 'center'
          }
        },
      }}  
    />
  )
}

export function PhaseControl({min, max, step, value, onChange, color, style}: {min?: number, max?: number, step?: number, value: number, onChange: ((e: ChangeEvent) => void), color: TrafficLightColors, style?: React.CSSProperties}) {
  
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
    <>
      <ButtonGroup fullWidth variant="outlined" size='small' aria-label="Basic button group" style={style}>
        <Button {...bindDec()} color={color} variant='contained' onClick={e => onChange(fix(value - 1, min, max, step))}>-</Button>
        <DelayedTextField value={value} onChange={val => onChange(fix(val, min, max, step))} />
        <Button {...bindInc()} color={color} variant='contained' onClick={e => onChange(fix(value + 1, min, max, step))}>+</Button>
      </ButtonGroup>
    </>
  )
}
