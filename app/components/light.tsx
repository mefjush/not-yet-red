"use client"

import TrafficLight from '../domain/traffic-light'
import LightConfig, { LightSettings } from '../domain/light-config'
import Input from './input'
import { IconButton, Card, CardActions, CardContent, Stack, Grid, Dialog, DialogTitle, DialogContent, Box, DialogActions, Button, TextField, IconButtonProps, CardHeader, Avatar, Collapse } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import ShareIcon from '@mui/icons-material/Share'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import { useRef, useState } from 'react'
import { Typography } from '@mui/material'
import Tune from './tune'
import { QRCodeSVG } from 'qrcode.react'
import { objectSerDeser } from '../url'
import { styled } from '@mui/material/styles';

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme }) => ({
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
  variants: [
    {
      props: ({ expand }) => !expand,
      style: {
        transform: 'rotate(0deg)',
      },
    },
    {
      props: ({ expand }) => !!expand,
      style: {
        transform: 'rotate(180deg)',
      },
    },
  ],
}));

export default function LightComponent({ index, currentTimestamp, light, lightConfig, onLightSettingsChange, onDelete, style }: { index: number, currentTimestamp: number, light: TrafficLight, lightConfig: LightConfig, onLightSettingsChange: (lightSettings: LightSettings) => void, onDelete?: () => void, style?: React.CSSProperties }) {

  const lightRef = useRef<HTMLImageElement>(null)

  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null)

  const [shareMode, setShareMode] = useState<Boolean>(false)

  const [expanded, setExpanded] = useState(true)

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const deleteButton = onDelete == null ? <></> : <IconButton aria-label="delete" onClick={() => onDelete()}><DeleteIcon /></IconButton>

  const currentPhase = light.currentPhase(currentTimestamp)

  const lightImg = <img className="the-traffic-light" ref={lightRef} src={currentPhase.state.file} alt={currentPhase.state.name} style={{ maxWidth: "100%", maxHeight: "70vh" }} />
  const tune = <Tune lightConfig={lightConfig} onLightSettingsChange={onLightSettingsChange} />

  const search = `?crossingSettings=${objectSerDeser().serialize(lightConfig.crossingSettings)}&lightSettings=${objectSerDeser().serialize([lightConfig.toLightSettings()])}`

  const baseUrl = typeof window === "undefined" ? process.env.NEXT_PUBLIC_SITE_URL : window.location.origin
  // const baseUrl = "http://192.168.0.106:3000" 
  const url = baseUrl + search

  console.log("Rendering light @ " + currentTimestamp)

  const qr = <div style={{ margin: "auto auto" }}><QRCodeSVG size={256} value={url} /></div>

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

  let durationInputs = lightConfig.phases.toSorted((a, b) => a.state.priority - b.state.priority).reverse().map(phase => (
    <Input key={`light-${index}-${phase.state.name}-duration`} label={`${phase.state.name} duration`} id={`light-${index}-${phase.state.name}-duration`} min={0} max={lightConfig.cycleLength() / 1000} value={phase.duration / 1000} onChange={e => onLightSettingsChange(lightConfig.withPhaseDuration(phase, e.target.value * 1000))} />
  ));

  return (
    <Card style={style}>
      <CardHeader
        avatar={
          <Avatar 
            aria-label="traffic-light" 
            sx={{ bgcolor: currentPhase.state.color }}
          >
            {index}
          </Avatar>
        }
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
        title={`Traffic Light #${index}`}
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Grid container sx={{ justifyContent: "space-between", alignItems: "center" }} spacing={4}>
            <Grid item xs={8} md={10}>
              <Stack direction="column" alignItems="stretch">
                <form>
                  {durationInputs}
                  <Input label="Offset" id={`light-${index}-offset`} min={0} max={(lightConfig.cycleLength() / 1000) - 1} value={lightConfig.offset / 1000} onChange={e => onLightSettingsChange(lightConfig.withOffset(e.target.value * 1000))} />
                </form>
              </Stack>
            </Grid>
            <Grid item xs={4} md={2}>
              <Grid container sx={{ alignItems: "center", justifyContent: "center" }}>
                {lightImg}
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Collapse>
      <CardActions>
        <IconButton aria-label="fullscreen" onClick={() => enterFullScreen()}><FullscreenIcon /></IconButton>
        <IconButton aria-label="share" onClick={() => setShareMode(!shareMode) }><ShareIcon /></IconButton>
        {deleteButton}
      </CardActions>
      {tune}
      <Dialog
        open={shareMode == true}
        onClose={() => setShareMode(false)}
      >
        <DialogTitle>Share</DialogTitle>
        <DialogContent>
          <Box
            noValidate
            component="form"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              m: 'auto',
              width: 'fit-content',
            }}
          >
            {qr}
            <TextField
              margin="normal"
              label="Url"
              fullWidth
              variant="outlined"
              defaultValue={url}
              inputProps={{ readOnly: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareMode(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}
