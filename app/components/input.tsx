"use client"

import { OverridableStringUnion } from '@mui/types';
import { Box, Slider, Typography, Input as MuiInput, Stack, ButtonGroup, Button, ButtonPropsColorOverrides } from '@mui/material'
import { styled } from '@mui/material/styles'
import { ColorizeOutlined } from '@mui/icons-material';

const MInput = styled(MuiInput)`
  width: 42px
`

interface ChangeEvent {
  target: {
    value: number
  }
}

export default function Input({id, label, min, max, step, value, onChange, color}: {id: string, label: string, min?: number, max?: number, step?: number, value: number, onChange: ((e: ChangeEvent) => void), color?: OverridableStringUnion<'inherit', ButtonPropsColorOverrides>}) {

  const toEvent = (val: any) => ({ target: { value: Number(val) }})

  const fix = (inVal: number) => {
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

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    onChange(fix(newValue as number))
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(toEvent(event.target.value === '' ? 0 : Number(event.target.value)))
  }

  return (
    <Box>
      {/* <Typography gutterBottom>
        {label}
      </Typography> */}
      <Stack direction="row" spacing={2}>
        {/* <Slider
          value={typeof value === 'number' ? value : 0}
          step={step || 1}
          min={min}
          max={max}
          onChange={handleSliderChange}
          aria-labelledby={id}
        />
        <MInput
          value={value}
          size="small"
          onChange={handleInputChange}
          inputProps={
            step: (step || 1),
            min: min,
            max: max,
            type: 'number',
            'aria-labelledby': id
          }}
        /> */}
          <Box width={150} sx={{ p: 1 }}>
          <ButtonGroup variant="outlined" aria-label="Basic button group" fullWidth>
            <Button color={color} variant='contained' onClick={e => onChange(fix(value - 1))}>-</Button>
            <Button color={color}>{value}</Button>
            <Button color={color} variant='contained' onClick={e => onChange(fix(value + 1))}>+</Button>
          </ButtonGroup>
          </Box>
        </Stack>
    </Box>
  )
}
