"use client"

import TrafficLight from '../domain/traffic-light'
import LightConfig, { LightSettings, PresetId, PRESETS, TimeRange } from '../domain/light-config'
import { IconButton, Card, CardActions, CardContent, Stack, Collapse, Slider, Typography, SliderComponentsPropsOverrides, Checkbox, Select, MenuItem, NoSsr, RadioGroup, FormControlLabel, Radio, duration, Box, Button, CardActionArea } from '@mui/material'
import Grid from '@mui/material/Grid2'
import DeleteIcon from '@mui/icons-material/Delete'
import ShareIcon from '@mui/icons-material/Share'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useEffect, useRef, useState } from 'react'
import Tune from './tune'
import { ExpandMore } from './expand-more'
import PhaseControls, { PhaseControl } from './phase-controls'
import LightIcon from './light-icon'
import React from 'react'
import { State, STATE_ATTRIBUTES } from '../domain/state'
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import EditIcon from '@mui/icons-material/Edit'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'

export default function LightComponent({ index, currentTimestamp, light, lightConfig, selected, onLightSettingsChange, onDelete, onSelectionChange, onFullscreen, onShare }: { index: number, currentTimestamp: number, light: TrafficLight, lightConfig: LightConfig, selected: boolean, onLightSettingsChange: (lightSettings: LightSettings) => void, onDelete?: () => void, onSelectionChange: (b: boolean) => void, onFullscreen: () => void, onShare: () => void }) {

  const [expanded, setExpanded] = useState(false)
  const [transitionStartTime, setTransitionStartTime] = useState(-1)
  const [sliderMode, setSliderMode] = useState("offset")
  const [quickEditActive, setQuickEditActive] = useState(true)
  const hasPageBeenRendered = useRef(false)

  const handleExpandClick = () => {
    setExpanded(!expanded);
  }

  const effectivelyExpanded = expanded // quickEditActive && expanded

  const deleteButton = onDelete == null ? <></> : <IconButton aria-label="delete" onClick={() => onDelete()}><DeleteIcon /></IconButton>

  let durationInputs = lightConfig.phases.toSorted((a, b) => a.stateAttributes().priority - b.stateAttributes().priority).reverse().map(phase => (
    <PhaseControls 
      key={`light-${index}-${phase.stateAttributes().name}-duration`} 
      label={`${phase.stateAttributes().name} duration`} 
      id={`light-${index}-${phase.stateAttributes().name}-duration`} 
      min={0} 
      max={lightConfig.cycleLength() / 1000} 
      value={phase.duration / 1000} 
      onChange={e => onLightSettingsChange(lightConfig.withStateDuration(phase.state, e.target.value * 1000))} 
      color={phase.stateAttributes().color}
    />
  ))

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

  const selectedPhase: State = sliderMode == "offset" || sliderMode == "lock" ? State.RED : State[sliderMode as keyof typeof State]
  const timeRange = lightConfig.getTimeRange(selectedPhase)

  const selectedPhaseRange = timeRange.toArray()
  let dummySliderValue: number | null = null
  if (selectedPhaseRange.length < 3) {
    dummySliderValue = selectedPhaseRange[0]
    selectedPhaseRange.push(dummySliderValue)
  }

  const onPhaseSliderChange = (state: State, newRange: number[]) => {

    if (dummySliderValue != null) {
      const dummyIndex = newRange.indexOf(dummySliderValue)
      if (dummyIndex > -1) { 
        newRange.splice(dummyIndex, 1)
      }
    }

    const cycleLength = lightConfig.cycleLength()
    const temp = newRange.filter(x => x != 0 && x != cycleLength)
    
    if (temp.length < 2) {
      temp.unshift(0)
    }

    const newVal = temp.find(x => x != timeRange.start && x != timeRange.end)

    if (newVal === undefined) {
      return
    }

    const newTimeRange = temp.includes(timeRange.start) ? new TimeRange(timeRange.start, newVal, cycleLength) : new TimeRange(newVal, timeRange.end, cycleLength)

    onLightSettingsChange(lightConfig.withStateTimeRange(state, newTimeRange))
  }

  const lockedSlider = (
    <Slider
      disabled
      value={lightConfig.offset / 1000}
      step={1}
      min={0} 
      max={(lightConfig.cycleLength() / 1000)}
      valueLabelDisplay="auto"
      valueLabelFormat={(value) => `${value} s`}
      onChange={(e, newValue) => onLightSettingsChange(lightConfig.withOffset(newValue as number * 1000))}
      aria-label="Offset"
      slots={{ 
        track: Tune 
      }}
      slotProps={{ 
        track: { lightConfig: lightConfig, onLightSettingsChange: onLightSettingsChange } as SliderComponentsPropsOverrides,
        rail: { style: { display: "none" } },
        mark: { style: { display: "none" } },
        markLabel: { style: { transitionDuration: `${transitionDuration}ms`, transitionTimingFunction: 'linear' } }
      }}
      marks={[{ value: markPositionToSet / 1000, label: <ArrowDropUpIcon /> }]} // TODO client-server conflict
      sx={{
        color: `${STATE_ATTRIBUTES[selectedPhase].color}.main`,
        '& .MuiSlider-thumb': {
          display: 'none',
        },
      }}
    />
  )

  const offsetSlider = (
    <Slider
      value={lightConfig.offset / 1000}
      step={1}
      min={0} 
      max={(lightConfig.cycleLength() / 1000)}
      valueLabelDisplay="auto"
      valueLabelFormat={(value) => `${value} s`}
      onChange={(e, newValue) => onLightSettingsChange(lightConfig.withOffset(newValue as number * 1000))}
      aria-label="Offset"
      slots={{ 
        track: Tune 
      }}
      slotProps={{ 
        track: { lightConfig: lightConfig, onLightSettingsChange: onLightSettingsChange } as SliderComponentsPropsOverrides,
        rail: { style: { display: "none" } },
        mark: { style: { display: "none" } },
        markLabel: { style: { transitionDuration: `${transitionDuration}ms`, transitionTimingFunction: 'linear' } }
      }}
      marks={[{ value: markPositionToSet / 1000, label: <ArrowDropUpIcon /> }]} // TODO client-server conflict
    />
  )

  const rangeSlider = (
    <Slider
      value={selectedPhaseRange.map(x => x / 1000)}
      step={1}
      min={0} 
      max={(lightConfig.cycleLength() / 1000)}
      valueLabelDisplay="auto"
      valueLabelFormat={(value) => `${value} s`}
      onChange={(e, newValue) => onPhaseSliderChange(selectedPhase, (newValue as number[]).map(x => x * 1000))}
      aria-label="Offset"
      slots={{ 
        track: Tune 
      }}
      slotProps={{ 
        track: { lightConfig: lightConfig, onLightSettingsChange: onLightSettingsChange } as SliderComponentsPropsOverrides,
        rail: { style: { display: "none" } },
        mark: { style: { display: "none" } },
        markLabel: { style: { transitionDuration: `${transitionDuration}ms`, transitionTimingFunction: 'linear' } }
      }}
      marks={[{ value: markPositionToSet / 1000, label: <ArrowDropUpIcon /> }]} // TODO client-server conflict
      sx={{
        color: `${STATE_ATTRIBUTES[selectedPhase].color}.main`,
        pointerEvents: 'none !important',
        '& .MuiSlider-thumb': {
          borderRadius: '1px',
          pointerEvents: 'all !important'
        },
        '& .MuiSlider-track': {
          pointerEvents: 'all !important'
        }
      }}
    />
  )

  const getSlider = () => {
    if (!quickEditActive) {
      return lockedSlider
    }
    switch(sliderMode) {
      case 'offset': return offsetSlider
      case 'lock': return lockedSlider
      default: return rangeSlider
    }
  }

  const theSlider = getSlider()

  const phase = lightConfig.phases.find(ph => ph.state == selectedPhase) || lightConfig.phases[0]
  
  const quickEditControls = (
    <>
      <RadioGroup
        row
        aria-labelledby="demo-radio-buttons-group-label"
        defaultValue="offset"
        name="radio-buttons-group"
        value={sliderMode}
        onChange={event => setSliderMode((event.target as HTMLInputElement).value)}
      >
        <FormControlLabel value="offset" control={<Radio size='small' icon={<KeyboardTabIcon color='disabled'/>} checkedIcon={<KeyboardTabIcon color='primary'/>}/>} label='' />
        { lightConfig.phases.map(phase => 
          <FormControlLabel 
            key={phase.state} 
            value={phase.state} 
            control={<Radio size='small' color={`${phase.stateAttributes().color}`} sx={{ color: `${phase.stateAttributes().color}.main` }}/>} 
            label=''
          />) 
        }
      </RadioGroup>
      <PhaseControl
        style={{marginLeft: 'auto'}}
        label={`${phase.stateAttributes().name} duration`} 
        id={`light-${index}-${phase.stateAttributes().name}-duration`} 
        min={0} 
        max={lightConfig.cycleLength() / 1000} 
        value={phase.duration / 1000} 
        onChange={e => onLightSettingsChange(lightConfig.withStateDuration(phase.state, e.target.value * 1000))} 
        color={phase.stateAttributes().color}
      />
      {/* <ExpandMore
        expand={effectivelyExpanded}
        onClick={handleExpandClick}
        aria-expanded={effectivelyExpanded}
        aria-label="show more"
        style={{marginLeft: 'auto'}}
      >
        <ExpandMoreIcon />
      </ExpandMore> */}
    </>
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
              
              {/* <Collapse in={effectivelyExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ my: 2 }}>
                  <Typography gutterBottom>
                    Preset
                  </Typography>
                  <Select fullWidth value={lightConfig.preset.presetId} onChange={event => onLightSettingsChange(lightConfig.withPreset(event.target.value as PresetId))}>
                    { 
                      Object.values(PRESETS).map(preset => 
                        <MenuItem key={preset.presetId} value={preset.presetId}>{preset.name}</MenuItem>
                      )
                    }
                  </Select>
                </Box>
                <Box sx={{ my: 2 }}>
                  <Typography gutterBottom>
                    Phases
                  </Typography>
                  {durationInputs}
                </Box>
              </Collapse> */}
              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>
                  Timeline
                </Typography>
                {theSlider}

                {/* <Box sx={{position: 'relative'}}>
                { phasesPositions.map(positionConfig => 
                  <Box sx={{ display: 'inline', position: 'absolute', top: '-74px', left: `${100 * positionConfig.position / lightConfig.cycleLength()}%` }}>
                    <Stack direction='column'>
                    <IconButton aria-label="plus"><AddCircleIcon sx={{ color: `${positionConfig.phase.stateAttributes().color}.main` }}/></IconButton>
                    <IconButton aria-label="minus"><RemoveCircleIcon sx={{ color: `${positionConfig.phase.stateAttributes().color}.main` }}/></IconButton>
                    </Stack>
                  </Box>
                )}
                </Box> */}
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>

      <CardActions>
        <IconButton aria-label="Quick edit" onClick={() => setQuickEditActive(!quickEditActive)}>{ expanded || quickEditActive ? <LockOpenIcon /> : <LockIcon />}</IconButton>
        { expanded || quickEditActive ? quickEditControls : null }
      </CardActions>

      <Collapse in={effectivelyExpanded} timeout="auto" unmountOnExit>
      <CardContent>
      <Stack direction="column" alignItems="stretch">
        <Box sx={{ my: 2 }}>
          <Typography gutterBottom>
            Preset
          </Typography>
          <Select fullWidth value={lightConfig.preset.presetId} onChange={event => onLightSettingsChange(lightConfig.withPreset(event.target.value as PresetId))}>
            { 
              Object.values(PRESETS).map(preset => 
                <MenuItem key={preset.presetId} value={preset.presetId}>{preset.name}</MenuItem>
              )
            }
          </Select>
        </Box>
        <Box sx={{ my: 2 }}>
          <Typography gutterBottom>
            Phases
          </Typography>
          {durationInputs}
        </Box>
        </Stack>
      </CardContent>
      </Collapse>
    </Card>
  )
}
