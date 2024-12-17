import { IconButton, Dialog, Button, AppBar, Toolbar, Typography, Stack, Select, MenuItem, Box, Breadcrumbs, Link } from '@mui/material'
import { createElement } from 'react'
import Grid from '@mui/material/Grid2'
import ShareIcon from '@mui/icons-material/Share'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import LightSettingsComponent from './LightSettings'
import Timeline from './Timeline'
import LightConfig, { LightSettings } from '../domain/LightConfig'
import LightHead from './LightHead'
import TrafficLight from '../domain/TrafficLight'
import TrafficIcon from '@mui/icons-material/Traffic'
import CircleIcon from '@mui/icons-material/Circle'
import GridGoldenratioIcon from '@mui/icons-material/GridGoldenratio'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { PresetId, PRESETS, SYMBOLS, SymbolId } from '../domain/Preset'
import LightUiState from '../domain/LightUiState'

export default function LightDetails({ open, onClose, onFullscreen, onShare, onLightSettingsChange, lightConfig, currentTimestamp, light, lightUiState, setLightUiState }: { open: boolean, onClose: () => void, onFullscreen: () => void, onShare: () => void, onLightSettingsChange: (lightSettings: LightSettings) => void, lightConfig: LightConfig, currentTimestamp: number, light: TrafficLight, lightUiState: LightUiState, setLightUiState: (lightUiState: LightUiState) => void }) {

  const selectedState = lightUiState.selectedState

  const handleClose = () => {
    onClose()
  }

  const lightHead = (
    <LightHead 
      currentTimestamp={currentTimestamp} 
      light={light} 
      lightConfig={lightConfig}
      maxHeight={ open ? 200 : 100 } 
      maxWidth={ 1000 } 
    />
  )

  const buttons = (
    <Stack direction='row'>
      <IconButton 
        size='large' 
        aria-label="share" 
        onClick={onShare}
      >
        <ShareIcon />
      </IconButton>

      <IconButton 
        size='large' 
        aria-label="fullscreen" 
        onClick={onFullscreen} 
        edge='end'
      >
        <FullscreenIcon />
      </IconButton>
    </Stack>
  )

  const generatePresetMenuItems = () => {
    return Object.values(PRESETS).map(preset => {
      const icon = preset.symbolId != SymbolId.NONE ? SYMBOLS[preset.symbolId].icon : CircleIcon
      const iconElement = createElement(icon, {})
      return (
        <MenuItem 
          key={preset.presetId} 
          value={preset.presetId}
        >
          <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
            {iconElement}
            <span>{preset.name}</span>
          </Stack>
        </MenuItem>
      )
    })
  }

  const changePreset = (presetId: PresetId) => {
    const supportedStates = PRESETS[presetId].states
    if (!supportedStates.includes(selectedState)) {
      setLightUiState(lightUiState.withSelectedState(supportedStates[0]))
    }
    onLightSettingsChange(lightConfig.withPreset(presetId))
  }

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
    >
      <AppBar className="mui-fixed">
        <Toolbar>
          <Breadcrumbs aria-label="breadcrumb" separator={<NavigateNextIcon fontSize="small" sx={{ mx: -1 }} />} style={{ color: 'white', fontSize: '1.25rem' }} sx={{ flex: 1 }}>
            <IconButton 
              size="large" 
              edge="start" 
              onClick={handleClose}
              color='inherit'
            >
              <GridGoldenratioIcon />
            </IconButton>

            <Stack direction='row'>
              <IconButton 
                size="large" 
                sx={{ color: 'white' }} 
              >
                <TrafficIcon />
              </IconButton>
              <Typography sx={{ display: 'flex', alignItems: 'center' }} variant="h6" color='inherit'>
                Traffic Light
              </Typography>
            </Stack>
          </Breadcrumbs>

          <Button color='inherit' onClick={handleClose} style={{ marginRight: '-15px' }}>Ok</Button>
        </Toolbar>
      </AppBar>
      <Toolbar />

      <Stack spacing={2} sx={{ p: 3 }}>
        <Grid container sx={{ justifyContent: "space-between", alignItems: "center" }} spacing={2}>
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <Typography gutterBottom>
              Preset
            </Typography>
            <Select 
              fullWidth 
              size='small' 
              value={lightConfig.preset.presetId} 
              onChange={event => changePreset(event.target.value as PresetId)}
            >
              { generatePresetMenuItems() }
            </Select>
          </Grid>

          <Grid size={{ xs: 12 }} display="flex" justifyContent="center" alignItems='flex-start'>
            <Box sx={{ visibility: 'hidden' }}>{buttons}</Box>
            <Box sx={{ flex: 1 }}></Box>
            {lightHead}
            <Box sx={{ flex: 1 }}></Box>
            {buttons}
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
              setSelectedState={(state) => setLightUiState(lightUiState.withSelectedState(state))}
              selectedState={selectedState}
            />
          </Grid>
        </Grid>
      </Stack>
    </Dialog>
  )
}
