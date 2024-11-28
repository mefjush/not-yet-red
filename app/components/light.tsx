"use client"

import TrafficLight from '../domain/traffic-light'
import LightConfig, { LightSettings, PresetId, PRESETS, TimeRange } from '../domain/light-config'
import { IconButton, Card, CardActions, CardContent, Stack, Collapse, Slider, Typography, SliderComponentsPropsOverrides, Checkbox, Select, MenuItem, NoSsr, RadioGroup, FormControlLabel, Radio, duration, Box, Button, CardActionArea, FormControl } from '@mui/material'
import Grid from '@mui/material/Grid2'
import DeleteIcon from '@mui/icons-material/Delete'
import ShareIcon from '@mui/icons-material/Share'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useEffect, useRef, useState } from 'react'
import Tune from './tune'
import { ExpandMore } from './expand-more'
import { PhaseControl } from './phase-controls'
import LightIcon from './light-icon'
import React from 'react'
import { State, STATE_ATTRIBUTES } from '../domain/state'
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import EditIcon from '@mui/icons-material/Edit'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import { negativeSafeMod } from '../utils'
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom'
import { time } from 'console'

export default function LightComponent({ index, currentTimestamp, light, lightConfig, selected, onLightSettingsChange, onDelete, onSelectionChange, onFullscreen, onShare }: { index: number, currentTimestamp: number, light: TrafficLight, lightConfig: LightConfig, selected: boolean, onLightSettingsChange: (lightSettings: LightSettings) => void, onDelete?: () => void, onSelectionChange: (b: boolean) => void, onFullscreen: () => void, onShare: () => void }) {

  const [expanded, setExpanded] = useState(false)
  const [transitionStartTime, setTransitionStartTime] = useState(-1)
  const [sliderMode, setSliderMode] = useState("RED")
  
  const hasPageBeenRendered = useRef(false)
  const uiOffset = useRef(0)

  const handleExpandClick = () => {
    setExpanded(!expanded);
  }

  const effectivelyExpanded = expanded

  const deleteButton = onDelete == null ? <></> : <IconButton aria-label="delete" onClick={() => onDelete()}><DeleteIcon /></IconButton>

  const markPosition = currentTimestamp % lightConfig.cycleLength()

  const needsTransition = hasPageBeenRendered && (transitionStartTime == markPosition)

  const transitionDuration = needsTransition ? lightConfig.cycleLength() - markPosition : 0
  const markPositionToSet = needsTransition ? lightConfig.cycleLength() : markPosition

  useEffect(() => {
    if (hasPageBeenRendered.current) {
      setTransitionStartTime(markPosition)
    } else {
      hasPageBeenRendered.current = true
      setTransitionStartTime(-2)
    }
  }, [markPosition, hasPageBeenRendered, transitionStartTime])

  const lightIcon = <LightIcon currentTimestamp={currentTimestamp} light={light} lightConfig={lightConfig} height={ effectivelyExpanded ? '150px' : '60px' } />

  const cycleLength = lightConfig.cycleLength()

  const selectedPhase: State = sliderMode == "offset" || sliderMode == "lock" ? State.RED : State[sliderMode as keyof typeof State]
  const timeRange = lightConfig.getTimeRange(selectedPhase)
  
  const uiRange = useRef(timeRange)

  const timeRangeChanged = !(timeRange.start == negativeSafeMod(uiRange.current.start, cycleLength) && timeRange.end == negativeSafeMod(uiRange.current.end, cycleLength))

  if (timeRangeChanged) {
    uiRange.current = new TimeRange(timeRange.start, timeRange.end == 0 ? cycleLength : timeRange.end, cycleLength)
  }

  const offsetSliderValue: number = negativeSafeMod(timeRange.start + timeRange.duration() / 2, cycleLength)
  const offsetChanged = offsetSliderValue != negativeSafeMod(uiOffset.current, cycleLength)
  if (offsetChanged) {
    uiOffset.current = offsetSliderValue
  }

  const onPhaseSliderChange = (state: State, newRange: number[], activeThumb: number) => {
    const newValRaw = newRange[activeThumb]

    uiRange.current = (activeThumb == 0) != uiRange.current.inverted() ? new TimeRange(newValRaw, uiRange.current.end, cycleLength) : new TimeRange(uiRange.current.start, newValRaw, cycleLength)

    const newTimeRange = new TimeRange(negativeSafeMod(uiRange.current.start, cycleLength), negativeSafeMod(uiRange.current.end, cycleLength), cycleLength) 

    onLightSettingsChange(lightConfig.withStateTimeRange(state, newTimeRange))
  }

  const onOffsetSliderChange = (newValue: number) => {
    const modResult = (timeRange.duration() / 1000) % 2 == 0 ? 0 : 500
    if (newValue % 1000 == modResult && 0 <= newValue && newValue <= cycleLength) {
      uiOffset.current = newValue
      onLightSettingsChange(lightConfig.withOffset(negativeSafeMod(lightConfig.offset + newValue - offsetSliderValue, lightConfig.cycleLength())))
    }
  }

  const slideWithThumbOnly = {
    pointerEvents: 'none !important',
    '& .MuiSlider-thumb': {
      pointerEvents: 'all !important'
    },
    '& .MuiSlider-track': {
      pointerEvents: 'all !important'
    }
  }

  // const middleOffsetSlider = (
  //   <Slider
  //     value={uiOffset.current}
  //     step={500}
  //     min={0} 
  //     max={cycleLength}
  //     onChange={(e, newValue) => onOffsetSliderChange((newValue as number))}
  //     aria-label="Offset"
  //     slots={{ 
  //       track: Tune 
  //     }}
  //     slotProps={{ 
  //       track: { lightConfig: lightConfig, onLightSettingsChange: onLightSettingsChange } as SliderComponentsPropsOverrides,
  //       rail: { style: { display: "none" } },
  //       mark: { style: { display: "none" } },
  //       markLabel: { style: { transitionDuration: `${transitionDuration}ms`, transitionTimingFunction: 'linear' } },
  //     }}
  //     marks={[{ value: markPositionToSet, label: <ArrowDropUpIcon /> }]} // TODO client-server conflict
  //     sx={slideWithThumbOnly}
  //   />
  // )

  const classicOffsetSlider = (
    <Slider
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
      }}
      marks={[{ value: markPositionToSet, label: <ArrowDropUpIcon /> }]} // TODO client-server conflict
      sx={slideWithThumbOnly}
    />
  )

  const rangeSlider = (
    <Slider
      disableSwap
      value={[uiRange.current.start / 1000, uiRange.current.end / 1000]}
      step={1}
      min={0} 
      max={(lightConfig.cycleLength() / 1000)}
      valueLabelDisplay="auto"
      valueLabelFormat={(value) => `${value} s`}
      onChange={(e, newValue, activeThumb) => onPhaseSliderChange(selectedPhase, (newValue as number[]).map(x => x * 1000), activeThumb)}
      aria-label="Range"
      track={false}
      slotProps={{ 
        rail: { style: { display: "none" } },
        thumb: { style: { borderRadius: '0px', width: '5px' } },
      }}
      sx={{
        ...slideWithThumbOnly,
        paddingY: 0,
        // marginY: 0,
        marginTop: '-30px',
        marginBottom: 0,
        color: `${STATE_ATTRIBUTES[selectedPhase].color}.main`,
      }}
    />
  )

  const quickEditControls = (
    <FormControl fullWidth>
      <RadioGroup
        row={!(expanded)}
        aria-labelledby="demo-radio-buttons-group-label"
        name="radio-buttons-group"
        value={sliderMode}
        onChange={event => setSliderMode((event.target as HTMLInputElement).value)}
      >
        <Stack direction={ expanded ? 'column' : 'row' } spacing={ expanded ? 1 : 0 }>
        { lightConfig.phases.map(phase => {
          const phaseControl = (
            <PhaseControl
              label={`${phase.stateAttributes().name} duration`} 
              id={`light-${index}-${phase.stateAttributes().name}-duration`} 
              min={0} 
              max={lightConfig.cycleLength() / 1000} 
              value={phase.duration / 1000} 
              onChange={e => onLightSettingsChange(lightConfig.withStateDuration(phase.state, e.target.value * 1000))} 
              color={phase.stateAttributes().color}
            />
          )
          return (
            <Stack direction='row'>
              <FormControlLabel 
                key={phase.state} 
                value={phase.state} 
                control={<Radio size='small' color={`${phase.stateAttributes().color}`} sx={{ color: `${phase.stateAttributes().color}.main` }}/>} 
                label=''
              />
              { expanded ? phaseControl : null }
            </Stack>
          )
        })}
        </Stack>
      </RadioGroup>

    </FormControl>
  )


  const phasesPositions = []
  let currPosition = lightConfig.offset
  for (let phase of lightConfig.phases) {
    phasesPositions.push({ phase: phase, position: currPosition})
    currPosition += phase.duration
  }

  return (
    <Card>
      <CardActions>
        <Checkbox value={selected} checked={selected} onChange={e => onSelectionChange(e.target.checked)}/>
        <IconButton aria-label="fullscreen" onClick={onFullscreen}><FullscreenIcon /></IconButton>
        <IconButton aria-label="share" onClick={onShare}><ShareIcon /></IconButton>
        {deleteButton}
        <IconButton sx={{ visibility: 'hidden' }}><DeleteIcon /></IconButton>
        <ExpandMore
          expand={effectivelyExpanded}
          onClick={handleExpandClick}
          aria-expanded={effectivelyExpanded}
          aria-label="show more"
          style={{marginLeft: 'auto'}}
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>

      <CardContent>
        <Grid container sx={{ justifyContent: "space-between", alignItems: "center" }} spacing={0}>
          <CardActionArea onClick={() => setExpanded(!expanded)}>
            <Grid size={{ xs: 12 }} display="flex" justifyContent="center" alignItems="center">
              {lightIcon}
            </Grid>
          </CardActionArea>
          <Grid size={{ xs: 12 }}>
            <Stack direction="column" alignItems="stretch">
              <Box sx={{ mt: 2 }}>
                {/* <Typography gutterBottom>
                  Timeline
                </Typography> */}
                {/* {offsetSlider} */}
                {classicOffsetSlider}
                {rangeSlider}
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>


      <CardContent>
        { expanded ? null : quickEditControls }
        <Collapse in={effectivelyExpanded} timeout="auto" unmountOnExit>
          <Grid container spacing={2}>
            <Grid size={{xs: 12, md: 4, lg: 3}}>
              <Typography gutterBottom>
                Phases
              </Typography>
              {quickEditControls}
            </Grid>
            <Grid size={{xs: 12, md: 4, lg: 3}}>
              <Typography gutterBottom>
                Preset
              </Typography>
              <Select fullWidth size='small' value={lightConfig.preset.presetId} onChange={event => onLightSettingsChange(lightConfig.withPreset(event.target.value as PresetId))}>
                { 
                  Object.values(PRESETS).map(preset => 
                    <MenuItem key={preset.presetId} value={preset.presetId}>{preset.name}</MenuItem>
                  )
                }
              </Select>
            </Grid>
          </Grid>
        </Collapse>
      </CardContent>

    </Card>
  )
}
