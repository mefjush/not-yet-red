"use client"

import TrafficLight from '../domain/TrafficLight'
import LightConfig, { LightSettings } from '../domain/LightConfig'
import { Card, CardActions, CardContent, Box, Stack, IconButton, Typography, Collapse, Button } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import Grid from '@mui/material/Grid2'
import PhaseControls, { StatePicker } from './PhaseControls'
import LightHead from './LightHead'
import React from 'react'
import Timeline from './Timeline'
import LightUiState from '../domain/LightUiState'
import PresetMenu from './PresetMenu'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'


export type LightRecord = {
  light: TrafficLight
  lightConfig: LightConfig
  expanded: boolean,
  onLightSettingsChange: (lightSettings: LightSettings) => void,
  setExpanded: (expanded: boolean) => void, 
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

  const { light, lightConfig, expanded, onLightSettingsChange, setExpanded } = lightRecord

  // const [expandedInternal, setExpandedInternal] = React.useState(false)

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
          <IconButton onClick={() => setExpanded(!expanded)} sx={sx}>
            {head}
          </IconButton>
        </Stack>
      </Grid>

      <CardContent>
        <Stack direction='column'>
          {timeline}
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 0 }}>
        <Box sx={{ mx: 2 }}>
          <StatePicker
            states={lightRecord.lightConfig.phases.map(phase => phase.state)}
            setSelectedState={(state) => setLightUiState(lightUiState.withSelectedState(state))}
            selectedState={lightUiState.selectedState}
          />
          
        </Box>
        <Button fullWidth onClick={() => setExpanded(!expanded)} endIcon={expanded ? <CloseIcon/> : <EditIcon/>}></Button>
      </CardActions>

      <Collapse in={expanded}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6, lg: 6 }}>
              <Typography gutterBottom>
                Phases
              </Typography>
              <PhaseControls
                lightConfig={lightRecord.lightConfig}
                setSelectedState={(state) => setLightUiState(lightUiState.withSelectedState(state))}
                selectedState={lightUiState.selectedState}
                onLightSettingsChange={onLightSettingsChange}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 6 }}>
              <Typography gutterBottom>
                Preset
              </Typography>
              <PresetMenu
                lightConfig={lightRecord.lightConfig}
                lightUiState={lightUiState}
                onLightSettingsChange={onLightSettingsChange}
                setLightUiState={setLightUiState}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Collapse>
    </Card>
  )

}
