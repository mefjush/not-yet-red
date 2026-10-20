import {
  Dialog,
  Typography,
  Stack,
  Grid,
  Box,
  Paper,
  useMediaQuery,
  useTheme,
  Button,
} from "@mui/material"
import Timeline from "./Timeline"
import LightConfig from "../domain/LightConfig"
import LightHead from "./LightHead"
import TrafficLight from "../domain/TrafficLight"
import PhaseControls, { StatePicker } from "./PhaseControls"
import PresetMenu from "./PresetMenu"
import BackButton from "./BackButton"
import { State } from "../domain/State"
import AppToolbar from "./AppToolbar"

export default function LightDetails({
  open,
  index,
  lightConfig,
  currentTimestamp,
  light,
  selectedState,
  onClose,
  onLightConfigChange,
  setSelectedState,
}: {
  open: boolean
  index: number
  lightConfig: LightConfig
  currentTimestamp: number
  light: TrafficLight
  selectedState: State
  onClose: () => void
  onLightConfigChange: (lightConfig: LightConfig) => void
  setSelectedState: (state: State) => void
}) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"))

  return (
    <Dialog fullScreen={fullScreen} fullWidth maxWidth="md" open={open} onClose={onClose}>
      <AppToolbar>
        <BackButton />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Light {index + 1}
        </Typography>
        <Button variant="contained" onClick={onClose}>
          Done
        </Button>
      </AppToolbar>

      <Grid container spacing={3} sx={{ p: { xs: 2, sm: 3 } }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            variant="outlined"
            sx={{ display: "flex", justifyContent: "center", py: 2, bgcolor: "background.default" }}
          >
            <LightHead
              currentTimestamp={currentTimestamp}
              light={light}
              lightConfig={lightConfig}
              maxHeight={220}
              maxWidth={1000}
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Type
              </Typography>
              <PresetMenu
                lightConfig={lightConfig}
                selectedState={selectedState}
                onLightConfigChange={onLightConfigChange}
                setSelectedState={setSelectedState}
              />
            </Box>

            <Box>
              <Typography variant="overline" color="text.secondary">
                Phase durations
              </Typography>
              <PhaseControls
                lightConfig={lightConfig}
                onLightConfigChange={onLightConfigChange}
                setSelectedState={setSelectedState}
              />
            </Box>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="overline" color="text.secondary">
            Timeline
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pick a phase, then drag its edges. Drag the bar to shift the whole cycle.
          </Typography>
          <Timeline
            currentTimestamp={currentTimestamp}
            lightConfig={lightConfig}
            onLightConfigChange={onLightConfigChange}
            selectedState={selectedState}
            editable={true}
          />
          <StatePicker
            phases={lightConfig.phases}
            preset={lightConfig.preset}
            setSelectedState={setSelectedState}
            selectedState={selectedState}
          />
        </Grid>
      </Grid>
    </Dialog>
  )
}
