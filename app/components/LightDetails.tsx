import {
  Dialog,
  Button,
  Typography,
  Stack,
} from "@mui/material"
import Grid from "@mui/material/Grid2"
import Timeline from "./Timeline"
import LightConfig, { LightSettings } from "../domain/LightConfig"
import LightHead from "./LightHead"
import TrafficLight from "../domain/TrafficLight"
import PhaseControls, { StatePicker } from "./PhaseControls"
import PresetMenu from "./PresetMenu"
import { LightRecord } from "./LightCard"
import { useRouter } from "next/navigation"
import BackButton from "./BackButton"
import { State } from "../domain/State"
import AppToolbar from "./AppToolbar"

export default function LightDetails({
  open,
  lightConfig,
  currentTimestamp,
  light,
  selectedState,
  onClose,
  onFullscreen,
  onShare,
  onDelete,
  onLightSettingsChange,
  setSelectedState,
  lightRecord,
}: {
  open: boolean
  lightConfig: LightConfig
  currentTimestamp: number
  light: TrafficLight
  selectedState: State
  onClose: () => void
  onFullscreen: () => void
  onShare: () => void
  onDelete: () => void
  onLightSettingsChange: (lightSettings: LightSettings) => void
  setSelectedState: (state: State) => void
  lightRecord: LightRecord
}) {
  const router = useRouter()

  const handleClose = () => {
    onClose()
  }

  const lightHead = (
    <LightHead
      currentTimestamp={currentTimestamp}
      light={light}
      lightConfig={lightConfig}
      maxHeight={open ? 200 : 100}
      maxWidth={1000}
    />
  )

  return (
    <Dialog fullScreen open={open} onClose={handleClose}>
      <AppToolbar>
        <Stack direction="row" sx={{ flex: 1 }}>
          <BackButton />
          <Typography
            sx={{ display: "flex", alignItems: "center" }}
            variant="h6"
            color="inherit"
          >
            Traffic Light
          </Typography>
        </Stack>

        <Button
          color="inherit"
          onClick={handleClose}
          style={{ marginRight: "-15px" }}
        >
          Ok
        </Button>
      </AppToolbar>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Grid
          container
          sx={{ justifyContent: "space-between", alignItems: "center" }}
          spacing={2}
        >
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <Typography gutterBottom>Preset</Typography>
            <PresetMenu
              lightConfig={lightRecord.lightConfig}
              selectedState={selectedState}
              onLightSettingsChange={onLightSettingsChange}
              setSelectedState={setSelectedState}
            />
          </Grid>

          <Grid
            size={{ xs: 12 }}
            display="flex"
            justifyContent="center"
            alignItems="flex-start"
          >
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
              states={lightRecord.lightConfig.phases.map(
                (phase) => phase.state,
              )}
              setSelectedState={setSelectedState}
              selectedState={selectedState}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <Typography gutterBottom>Phases</Typography>
            <PhaseControls
              lightConfig={lightConfig}
              onLightSettingsChange={onLightSettingsChange}
              setSelectedState={setSelectedState}
            />
          </Grid>
        </Grid>
      </Stack>
    </Dialog>
  )
}
