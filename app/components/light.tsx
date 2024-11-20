"use client"

import TrafficLight from '../domain/traffic-light'
import LightConfig, { LightSettings, PresetId, PRESETS } from '../domain/light-config'
import { IconButton, Card, CardActions, CardContent, Stack, Collapse, Slider, Typography, SliderComponentsPropsOverrides, Checkbox, Select, MenuItem, NoSsr } from '@mui/material'
import Grid from '@mui/material/Grid2'
import DeleteIcon from '@mui/icons-material/Delete'
import ShareIcon from '@mui/icons-material/Share'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useEffect, useRef, useState } from 'react'
import Tune from './tune'
import { ExpandMore } from './expand-more'
import PhaseControls from './phase-controls'
import LightIcon from './light-icon'
import React from 'react'

export default function LightComponent({ index, currentTimestamp, light, lightConfig, selected, onLightSettingsChange, onDelete, onSelectionChange, onFullscreen, onShare }: { index: number, currentTimestamp: number, light: TrafficLight, lightConfig: LightConfig, selected: boolean, onLightSettingsChange: (lightSettings: LightSettings) => void, onDelete?: () => void, onSelectionChange: (b: boolean) => void, onFullscreen: () => void, onShare: () => void }) {

  const [expanded, setExpanded] = useState(true)
  const [transitionStartTime, setTransitionStartTime] = useState(-1)
  const hasPageBeenRendered = useRef(false)

  const handleExpandClick = () => {
    setExpanded(!expanded);
  }

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

  const lightIcon = <LightIcon currentTimestamp={currentTimestamp} light={light} lightConfig={lightConfig} height={ expanded ? '150px' : '60px' } />

  return (
    <Card>
      <CardActions>
        <Checkbox value={selected} checked={selected} onChange={e => onSelectionChange(e.target.checked)}/>
        <IconButton aria-label="fullscreen" onClick={onFullscreen}><FullscreenIcon /></IconButton>
        <IconButton aria-label="share" onClick={onShare}><ShareIcon /></IconButton>
        {deleteButton}
        <IconButton sx={{ visibility: 'hidden' }}><DeleteIcon /></IconButton>
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
          style={{marginLeft: 'auto'}}
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>

      <CardContent>
        <Grid container sx={{ justifyContent: "space-between", alignItems: "center" }} spacing={4}>
          <Grid size={{ xs: expanded ? 12 : 3, md: 2, lg: 1 }} display="flex" justifyContent="center" alignItems="center">
            {lightIcon}
          </Grid>
          <Grid size={{ xs: expanded ? 12 : 9, md: 10, lg: 11 }}>
            <Typography gutterBottom>
              Offset
            </Typography>
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
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Stack direction="column" alignItems="stretch" spacing={2}>
                <Typography gutterBottom>
                  Preset
                </Typography>
                <Select value={lightConfig.preset.presetId} onChange={event => onLightSettingsChange(lightConfig.withPreset(event.target.value as PresetId))}>
                  { 
                    Object.values(PRESETS).map(preset => 
                      <MenuItem key={preset.presetId} value={preset.presetId}>{preset.name}</MenuItem>
                    )
                  }
                </Select>
                <Typography gutterBottom>
                  Phases
                </Typography>
                {durationInputs}
              </Stack>
            </Collapse>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
