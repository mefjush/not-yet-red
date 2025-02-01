import { IconButton, Dialog, Button, AppBar, Toolbar, Typography, Stack, Box } from '@mui/material'
import Grid from '@mui/material/Grid2'
import Timeline from './Timeline'
import LightConfig, { LightSettings } from '../domain/LightConfig'
import LightHead from './LightHead'
import TrafficLight from '../domain/TrafficLight'
import TrafficIcon from '@mui/icons-material/Traffic'
import LightUiState from '../domain/LightUiState'
import PhaseControls, { StatePicker } from './PhaseControls'
import PresetMenu from './PresetMenu'
import { LightRecord } from './LightCard'
import { useRouter } from 'next/navigation'
import BackButton from './BackButton'

export default function LightDetails({ 
  open, 
  lightConfig, 
  currentTimestamp, 
  light, 
  lightUiState, 
  onClose, 
  onFullscreen, 
  onShare, 
  onDelete,
  onLightSettingsChange, 
  setLightUiState,
  lightRecord
}: { 
  open: boolean, 
  lightConfig: LightConfig, 
  currentTimestamp: number, 
  light: TrafficLight, 
  lightUiState: LightUiState, 
  onClose: () => void, 
  onFullscreen: () => void, 
  onShare: () => void, 
  onDelete: () => void,
  onLightSettingsChange: (lightSettings: LightSettings) => void, 
  setLightUiState: (lightUiState: LightUiState) => void,
  lightRecord: LightRecord
}) {

  const router = useRouter()

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

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
    >
      <AppBar className="mui-fixed">
        <Toolbar>
          <Stack direction='row' sx={{ flex: 1 }}>
            <BackButton />
            <Typography sx={{ display: 'flex', alignItems: 'center' }} variant="h6" color='inherit'>
              Traffic Light
            </Typography>
          </Stack>

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
            <PresetMenu
              lightConfig={lightRecord.lightConfig}
              lightUiState={lightUiState}
              onLightSettingsChange={onLightSettingsChange}
              setLightUiState={setLightUiState}
            />
          </Grid>

          <Grid size={{ xs: 12 }} display="flex" justifyContent="center" alignItems='flex-start'>
            {lightHead}
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
            <StatePicker
              states={lightRecord.lightConfig.phases.map(phase => phase.state)}
              setSelectedState={(state) => setLightUiState(lightUiState.withSelectedState(state))}
              selectedState={lightUiState.selectedState}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <Typography gutterBottom>
              Phases
            </Typography>
            <PhaseControls
              lightConfig={lightConfig}
              onLightSettingsChange={onLightSettingsChange}
              setSelectedState={(state) => setLightUiState(lightUiState.withSelectedState(state))}
            />
          </Grid>
        </Grid>
      </Stack>
    </Dialog>
  )
}
