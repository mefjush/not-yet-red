"use client"

import TrafficLight from '../domain/traffic-light'
import LightConfig, { LightSettings } from '../domain/light-config'
import Input from './input'
import { IconButton, Card, CardActions, CardContent, Stack, Dialog, DialogTitle, DialogContent, Box, DialogActions, Button, TextField, IconButtonProps, CardHeader, Avatar, Collapse, Slider, Typography, SlotComponentProps, SliderComponentsPropsOverrides, SliderOwnerState, InputAdornment } from '@mui/material'
import Grid from '@mui/material/Grid2'
import DeleteIcon from '@mui/icons-material/Delete'
import ShareIcon from '@mui/icons-material/Share'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import { useRef, useState } from 'react'
import Tune from './tune'
import { CrossingSettingsSerDeser, LightSettingsSerDeser } from '../url'
import { ExpandMore } from './expand-more'
import ShareDialog from './share-dialog'


export default function LightComponent({ index, currentTimestamp, light, lightConfig, onLightSettingsChange, onDelete }: { index: number, currentTimestamp: number, light: TrafficLight, lightConfig: LightConfig, onLightSettingsChange: (lightSettings: LightSettings) => void, onDelete?: () => void }) {

  const lightRef = useRef<HTMLImageElement>(null)

  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null)

  const [shareMode, setShareMode] = useState<boolean>(false)

  const [expanded, setExpanded] = useState(true)

  const handleExpandClick = () => {
    setExpanded(!expanded);
  }

  const deleteButton = onDelete == null ? <></> : <IconButton aria-label="delete" onClick={() => onDelete()} style={{marginLeft: 'auto'}}><DeleteIcon /></IconButton>

  const currentPhase = light.currentPhase(currentTimestamp)

  const lightImg = <img className="the-traffic-light" ref={lightRef} src={currentPhase.stateAttributes().file} alt={currentPhase.stateAttributes().name} style={{ maxWidth: "100%", maxHeight: "200px" }} />
  const tune = <Tune lightConfig={lightConfig} onLightSettingsChange={onLightSettingsChange} />

  const search = `?crossing=${CrossingSettingsSerDeser.serialize(lightConfig.crossingSettings)}&lights=${LightSettingsSerDeser.serialize([lightConfig.toLightSettings()])}`

  const baseUrl = typeof window === "undefined" ? process.env.NEXT_PUBLIC_SITE_URL : window.location.origin
  // const baseUrl = "http://192.168.0.106:3000" 
  const url = baseUrl + search

  console.log("Rendering light @ " + currentTimestamp)



  const requestWakeLock = async () => {
    try {
      if (navigator && navigator.wakeLock) {
        const wakeLock = await navigator.wakeLock.request()
        setWakeLock(wakeLock)
      }
    } catch (err: any) {
      alert(`${err.name}, ${err.message}`)
      console.error(`${err.name}, ${err.message}`)
    }
  }

  const releaseWakeLock = async () => {
    if (!wakeLock) {
      return
    }
    try {
      wakeLock.release()
      setWakeLock(null)
    } catch (err: any) {
      console.error(`${err.name}, ${err.message}`)
    }
  }

  const enterFullScreen = function () {
    requestWakeLock()
    lightRef.current?.requestFullscreen().finally(() => releaseWakeLock())
  }

  let durationInputs = lightConfig.phases.toSorted((a, b) => a.stateAttributes().priority - b.stateAttributes().priority).reverse().map(phase => (
    <Input 
      key={`light-${index}-${phase.stateAttributes().name}-duration`} 
      label={`${phase.stateAttributes().name} duration`} 
      id={`light-${index}-${phase.stateAttributes().name}-duration`} 
      min={0} 
      max={lightConfig.cycleLength() / 1000} 
      value={phase.duration / 1000} 
      onChange={e => onLightSettingsChange(lightConfig.withStateDuration(phase.state, e.target.value * 1000))} 
      color={phase.stateAttributes().color}
    />
  ));

  let avatar = (
    <Avatar 
      aria-label="traffic-light" 
      sx={{ bgcolor: currentPhase.stateAttributes().color }}
    >
      {index}
    </Avatar>
  )

  let title = (
    <Box sx={{ mx: 2 }}>
      <Typography gutterBottom>
        Traffic Light #{index}
      </Typography>
    </Box>
  )

  return (
    <Card>
      <CardHeader
        avatar={avatar}
        action={
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        }
        title={title}
      />
      <Box sx={{ mx: 4 }}>
        <Slider
          value={lightConfig.offset / 1000}
          step={1}
          min={0} 
          max={(lightConfig.cycleLength() / 1000)}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `Offset: ${value} s`}
          onChange={(e, newValue) => onLightSettingsChange(lightConfig.withOffset(newValue as number * 1000))}
          aria-label="Offset"
          slots={{ track: Tune }}
          slotProps={{ track: { lightConfig: lightConfig, onLightSettingsChange: onLightSettingsChange } as SlotComponentProps<'span', SliderComponentsPropsOverrides, SliderOwnerState> }}
        />
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Grid container sx={{ justifyContent: "space-between", alignItems: "center" }} spacing={4}>
            <Grid size="auto">
              {lightImg}
            </Grid>
            <Grid size="grow">
              <Stack direction="column" alignItems="stretch">
                <form>
                  {durationInputs}
                </form>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Collapse>

      <CardActions>
        <IconButton aria-label="fullscreen" onClick={() => enterFullScreen()}><FullscreenIcon /></IconButton>
        <IconButton aria-label="share" onClick={() => setShareMode(!shareMode) }><ShareIcon /></IconButton>
        {deleteButton}
      </CardActions>
      {/* {tune} */}
      <ShareDialog
        url={url}
        open={shareMode == true}
        onClose={() => setShareMode(false)}
      />
    </Card>
  )
}
