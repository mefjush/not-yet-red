"use client"

import { Box, Grid, Slider, Typography, Input as MuiInput } from '@mui/material'
import { styled } from '@mui/material/styles'

const MInput = styled(MuiInput)`
  width: 42px
`;

interface ChangeEvent {
  target: {
    value: number
  }
}


export default function Input({id, label, min, max, step, value, onChange}: {id: string, label: string, min?: number, max?: number, step?: number, value: number, onChange: ((e: ChangeEvent) => void)}) {

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
      <Typography gutterBottom>
        {label}
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs>
          <Slider
            value={typeof value === 'number' ? value : 0}
            step={step || 1}
            min={min}
            max={max}
            onChange={handleSliderChange}
            aria-labelledby={id}
          />
        </Grid>
        <Grid item>
          <MInput
            value={value}
            size="small"
            onChange={handleInputChange}
            inputProps={{
              step: (step || 1),
              min: min,
              max: max,
              type: 'number',
              'aria-labelledby': id
            }}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
