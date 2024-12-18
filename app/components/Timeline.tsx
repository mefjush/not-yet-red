"use client"

import LightConfig, { LightSettings, TimeRange } from '../domain/LightConfig'
import { Box, Slider, SliderComponentsPropsOverrides } from '@mui/material'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import { useEffect, useRef, useState } from 'react'
import Tune from './Tune'
import React from 'react'
import { State, STATE_ATTRIBUTES } from '../domain/State'
import { negativeSafeMod } from '../utils'

export default function Timeline({ 
  currentTimestamp, 
  lightConfig, 
  selectedState, 
  editable,
  onLightSettingsChange
}: { 
  currentTimestamp: number, 
  lightConfig: LightConfig, 
  selectedState?: State, 
  editable: boolean,
  onLightSettingsChange: (lightSettings: LightSettings) => void, 
 }) {

  const [transitionStartTime, setTransitionStartTime] = useState(-1)
  
  const hasPageBeenRendered = useRef(false)
  const uiOffset = useRef(0)

  const cycleLength = lightConfig.cycleLength()

  const timeRange = selectedState ? lightConfig.getTimeRange(selectedState) : new TimeRange(0, 0, 0)  

  const toUiFirendlyTimeRange = (timeRange: TimeRange): TimeRange => new TimeRange(timeRange.start, timeRange.end == 0 ? cycleLength : timeRange.end, cycleLength)

  const uiRange = useRef(toUiFirendlyTimeRange(timeRange))

  const markPosition = currentTimestamp % cycleLength

  const needsTransition = hasPageBeenRendered && (transitionStartTime == markPosition)

  const transitionDuration = needsTransition ? cycleLength - markPosition : 0
  const markPositionToSet = needsTransition ? cycleLength : markPosition

  const modCycle = (val: number) => negativeSafeMod(val, cycleLength)

  useEffect(() => {
    if (hasPageBeenRendered.current) {
      setTransitionStartTime(markPosition)
    } else {
      hasPageBeenRendered.current = true
      setTransitionStartTime(-2)
    }
  }, [markPosition, hasPageBeenRendered, transitionStartTime])

  const timeRangeChanged = !(timeRange.start == modCycle(uiRange.current.start) && timeRange.end == modCycle(uiRange.current.end))

  if (timeRangeChanged) {
    uiRange.current = toUiFirendlyTimeRange(timeRange)
  }

  const offsetSliderValue: number = modCycle(timeRange.start + timeRange.duration() / 2)
  const offsetChanged = offsetSliderValue != modCycle(uiOffset.current)
  if (offsetChanged) {
    uiOffset.current = offsetSliderValue
  }

  const onPhaseSliderChange = (state: State, newRange: number[], activeThumb: number) => {
    const newValRaw = newRange[activeThumb]

    uiRange.current = (activeThumb == 0) != uiRange.current.inverted() ? new TimeRange(newValRaw, uiRange.current.end, cycleLength) : new TimeRange(uiRange.current.start, newValRaw, cycleLength)

    const newTimeRange = new TimeRange(modCycle(uiRange.current.start), modCycle(uiRange.current.end), cycleLength) 

    onLightSettingsChange(lightConfig.withStateTimeRange(state, newTimeRange))
  }

  const slideWithThumbOnly = {
    pointerEvents: 'none !important',
    '& .MuiSlider-thumb': {
      pointerEvents: 'all !important'
    },
    '& .MuiSlider-track': {
      pointerEvents: 'none !important'
    }
  }

  const thumbStyle = editable ? {} : { display: 'none' }

  const offsetSlider = (
    <Slider
      disabled={!editable}
      value={lightConfig.offset}
      step={1000}
      min={0} 
      max={cycleLength}
      onChange={(e, newValue) => onLightSettingsChange(lightConfig.withOffset((newValue as number)))}
      aria-label="Offset"
      slots={{ 
        track: Tune 
      }}
      slotProps={{ 
        track: { lightConfig: lightConfig, onLightSettingsChange: onLightSettingsChange } as SliderComponentsPropsOverrides,
        rail: { style: { display: "none" } },
        mark: { style: { display: "none" } },
        markLabel: { style: { transitionDuration: `${transitionDuration}ms`, transitionTimingFunction: 'linear' } },
        thumb: { style: thumbStyle }
      }}
      marks={[{ value: markPositionToSet, label: <ArrowDropUpIcon /> }]} // TODO client-server conflict
      sx={slideWithThumbOnly}
    />
  )

  const trackStyle = uiRange.current.inverted() ? { backgroundColor: 'white', height: '2px' } : { height: '1px' }

  const getRangeSlider = (selectedState: State) => (
    <Slider
      disableSwap
      value={[uiRange.current.start, uiRange.current.end]}
      step={1000}
      min={0} 
      max={(cycleLength)}
      onChange={(e, newValue, activeThumb) => onPhaseSliderChange(selectedState, newValue as number[], activeThumb)}
      aria-label="Range"
      track={uiRange.current.inverted() ? 'inverted' : 'normal'}
      slotProps={{ 
        track: { style: { ...trackStyle, border: 'none' } },
        rail: { style: { display: uiRange.current.inverted() ? 'inline' : 'none', height: '1px' } },
        thumb: { style: { borderRadius: '0px', width: '1px', marginTop: '10px' } },
        mark: { style: { display: "none" } },
        markLabel: { style: { marginTop: '-36px' } },
      }}
      sx={{
        ...slideWithThumbOnly,
        // paddingBottom: 0,
        // marginY: 0,
        marginBottom: 0,
        color: `${STATE_ATTRIBUTES[selectedState].color}.main`,
      }}
      marks={[{ value: modCycle((timeRange.start + (timeRange.duration()) / 2)), label: `${timeRange.duration() / 1000} s` }]}
    />
  )

  const rangeSlider = editable && selectedState ? getRangeSlider(selectedState) : null

  return (
    <Box sx={{ my: 2 }}>
      {rangeSlider}
      {offsetSlider}
    </Box>
  )
}
