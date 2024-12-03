import { IconButton, Dialog, Button, AppBar, Toolbar, Typography, Stack, Select, MenuItem } from '@mui/material'
import { useRef, useState } from 'react'
import Grid from '@mui/material/Grid2'
import SettingsIcon from '@mui/icons-material/Settings'
import ShareIcon from '@mui/icons-material/Share'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import LightSettingsComponent from './light-settings'
import Timeline from './timeline'
import LightConfig, { LightSettings, PresetId, PRESETS } from '../domain/light-config'
import { State } from '../domain/state'
import LightIcon from './light-icon'
import TrafficLight from '../domain/traffic-light'

export default function ExpandDialog({ open, onClose, onFullscreen, onShare, onLightSettingsChange, lightConfig, currentTimestamp, light }: { open: boolean, onClose: () => void, onFullscreen: () => void, onShare: () => void, onLightSettingsChange: (lightSettings: LightSettings) => void, lightConfig: LightConfig, currentTimestamp: number, light: TrafficLight }) {

  const [selectedState, setSelectedState] = useState(State.RED)
  const lightSettingsSnapshot = useRef(lightConfig.toLightSettings())

  const handleClose = (commit: boolean) => {
    if (!commit) {
      onLightSettingsChange(lightSettingsSnapshot.current)
    }
    onClose()
  }

  const changePreset = (presetId: PresetId) => {
    const supportedStates = PRESETS[presetId].states
    if (!supportedStates.includes(selectedState)) {
      setSelectedState(supportedStates[0])
    }
    onLightSettingsChange(lightConfig.withPreset(presetId))
  }

  const lightIcon = (
    <LightIcon 
      currentTimestamp={currentTimestamp} 
      light={light} 
      lightConfig={lightConfig}
      height={ open ? '150px' : '60px' } 
    />
  )

  return (
    <Dialog
      fullScreen
      open={open}
    >
      <AppBar position='fixed'>
        <Toolbar>
          <IconButton 
            size="large" 
            edge="start" 
            color='inherit' 
          >
            <SettingsIcon />
          </IconButton>
          <Typography sx={{ flex: 1 }} variant="h6" component="div">
            Traffic Light
          </Typography>
          <IconButton color='inherit' aria-label="share" onClick={onShare}><ShareIcon /></IconButton>
          <IconButton color='inherit' aria-label="fullscreen" onClick={onFullscreen} edge='end'><FullscreenIcon /></IconButton>
        </Toolbar>
      </AppBar>
      <Toolbar />

      <Stack spacing={2} sx={{ p: 3 }}>
        <Grid container sx={{ justifyContent: "space-between", alignItems: "center" }} spacing={2}>

          <Grid size={{xs: 12, md: 4, lg: 3}}>
            <Typography gutterBottom>
              Preset
            </Typography>
            <Select 
              fullWidth 
              size='small' 
              value={lightConfig.preset.presetId} 
              onChange={event => changePreset(event.target.value as PresetId)}
            >
              { 
                Object.values(PRESETS).map(preset => 
                  <MenuItem key={preset.presetId} value={preset.presetId}>{preset.name}</MenuItem>
                )
              }
            </Select>
          </Grid>

          <Grid size={{ xs: 12 }} display="flex" justifyContent="center" alignItems="center">
            {lightIcon}
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Timeline 
              currentTimestamp={currentTimestamp} 
              lightConfig={lightConfig} 
              onLightSettingsChange={onLightSettingsChange} 
              selectedState={selectedState}
              editable={true}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <LightSettingsComponent
              lightConfig={lightConfig}
              onLightSettingsChange={onLightSettingsChange}
              setSelectedState={setSelectedState}
              selectedState={selectedState}
            />
          </Grid>

          <Grid size={{xs: 12}}>
            <Stack direction={'row'} spacing={2} sx={{ mt: 4 }}>
              <Button variant='outlined' onClick={() => handleClose(false)} fullWidth>Cancel</Button>
              <Button variant='contained' onClick={() => handleClose(true)} fullWidth>Save</Button>
            </Stack>
          </Grid>

        </Grid>
      </Stack>
    </Dialog>
  )
}
