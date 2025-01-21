"use client"

import TrafficLight from '../domain/TrafficLight'
import LightConfig, { LightSettings } from '../domain/LightConfig'
import { Card, CardActions, CardContent, Box, Stack, IconButton } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { StatePicker } from './PhaseControls'
import LightHead from './LightHead'
import React from 'react'
import Timeline from './Timeline'
import LightUiState from '../domain/LightUiState'

export type LightRecord = {
  light: TrafficLight
  lightConfig: LightConfig
  onLightSettingsChange: (lightSettings: LightSettings) => void, 
  setExpanded: () => void, 
}

export default function LightCard({ 
  currentTimestamp,
  lightUiState,
  setLightUiState,
  onDelete,
  lightRecord
}: { 
  currentTimestamp: number,
  lightUiState: LightUiState
  setLightUiState: (lightUiState: LightUiState) => void,
  onDelete: () => void, 
  lightRecord: LightRecord
}) {

  const { light, lightConfig, onLightSettingsChange, setExpanded } = lightRecord

  const head = (
    <LightHead 
      currentTimestamp={currentTimestamp} 
      light={light} 
      lightConfig={lightConfig} 
      maxHeight={ 100 } 
      maxWidth={ 1000 } 
    />
  )

  const sx = {
    borderRadius: 0,
    '.MuiTouchRipple-ripple .MuiTouchRipple-child': {
      borderRadius: 0
    },
  }

  const timeline = (
    <Timeline
      currentTimestamp={currentTimestamp} 
      lightConfig={lightConfig} 
      onLightSettingsChange={onLightSettingsChange} 
      selectedState={lightUiState.selectedState}
      editable={true}
    />
  )

  return (
    <Card>
      <CardActions></CardActions>

      <Grid container justifyContent="center" alignItems="center">
        <Stack direction='row' alignItems='flex-end'>
          <IconButton onClick={setExpanded} sx={sx}>
            {head}
          </IconButton>
        </Stack>
      </Grid>

      <CardContent>
        <Stack direction='column'>
          {timeline}
        </Stack>
      </CardContent>

      <CardActions>
        <Box sx={{ ml: 1 }}>
          <StatePicker
            states={lightRecord.lightConfig.phases.map(phase => phase.state)}
            setSelectedState={(state) => setLightUiState(lightUiState.withSelectedState(state))}
            selectedState={lightUiState.selectedState}
          />
        </Box>
      </CardActions>

    </Card>
  )

}
