"use client"

import LightConfig, { LightSettings, PresetId, PRESETS } from '../domain/light-config'
import { Typography, Select, MenuItem } from '@mui/material'
import PhaseControls from './phase-controls'
import React from 'react'
import { State } from '../domain/state'
import Grid from '@mui/material/Grid2'

export default function LightSettingsComponent({ lightConfig, onLightSettingsChange, setSelectedState, selectedState }: { lightConfig: LightConfig, onLightSettingsChange: (lightSettings: LightSettings) => void, setSelectedState: (state: State) => void, selectedState?: State }) {

  const quickEditControls = (
    <PhaseControls
      lightConfig={lightConfig}
      onLightSettingsChange={onLightSettingsChange}
      setSelectedState={setSelectedState}
      selectedState={selectedState}
      expanded={true}
    />
  )

  return (
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
  )
}