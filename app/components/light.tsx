"use client"

import TrafficLight from '../domain/traffic-light'
import LightConfig, { LightSettings } from '../domain/light-config'
import Input from './input'
import { IconButton, Card, CardActions, CardContent, Stack, Grid } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import { useRef, useState } from 'react'
import { Typography } from '@mui/material'
import Tune from './tune'
import { UiMode } from '../ui-mode'
import { QRCodeSVG } from 'qrcode.react'
import { objectSerDeser } from '../url'
import { STATE } from '../domain/state'

export default function LightComponent({ index, mode, currentTimestamp, light, lightConfig, onLightSettingsChange, onDelete, style }: { index: number, mode: UiMode, currentTimestamp: number, light: TrafficLight, lightConfig: LightConfig, onLightSettingsChange: (lightSettings: LightSettings) => void, onDelete?: () => void, style?: React.CSSProperties }) {

  const lightRef = useRef<HTMLImageElement>(null)

  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null)

  const deleteButton = onDelete == null ? <></> : <IconButton aria-label="delete" onClick={() => onDelete()} style={{ marginLeft: "auto" }}><DeleteIcon /></IconButton>

  const currentPhase = light.currentPhase(currentTimestamp)

  const lightImg = <img className="the-traffic-light" ref={lightRef} src={currentPhase.state.file} alt={currentPhase.state.name} style={{ width: "220px", maxWidth: "100%", maxHeight: "90vh" }} />
  const tune = <Tune lightConfig={lightConfig} onLightSettingsChange={onLightSettingsChange} />

  const search = `?crossingSettings=${objectSerDeser().serialize(lightConfig.crossingSettings)}&lightSettings=${objectSerDeser().serialize([lightConfig.toLightSettings()])}`

  const baseUrl = typeof window === "undefined" ? process.env.NEXT_PUBLIC_SITE_URL : window.location.origin
  // const baseUrl = "http://192.168.0.106:3000" 
  const url = baseUrl + search

  console.log("Rendering light @ " + currentTimestamp)

  const qr = mode.qr ? <div style={{ margin: "auto auto" }}><QRCodeSVG size={256} value={url} /></div> : <></>

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

  let durationInputs = lightConfig.phases.sort((a, b) => a.state.priority - b.state.priority).reverse().map(phase => (
    <Input key={`light-${index}-${phase.state.name}-duration`} label={`${phase.state.name} duration`} id={`light-${index}-${phase.state.name}-duration`} min={0} max={lightConfig.cycleLength() / 1000} value={phase.duration / 1000} onChange={e => onLightSettingsChange(lightConfig.withPhaseDuration(phase, e.target.value * 1000))} />
  ));

  return (
    <Card style={style}>
      <CardContent>
        <Typography sx={{ fontSize: 14, mb: 1.5 }} color="text.secondary" gutterBottom>
          Light #{index} {currentTimestamp}
        </Typography>
        <Grid container sx={{ justifyContent: "space-between" }}>
          <Grid item xs={8}>
            <Stack direction="column" alignItems="stretch">
              <form>
                <Input label="Offset duration" id={`light-${index}-offset`} min={0} max={(lightConfig.cycleLength() / 1000) - 1} value={lightConfig.offset / 1000} onChange={e => onLightSettingsChange(lightConfig.withOffset(e.target.value * 1000))} />
                {durationInputs}
              </form>
              {tune}
              {qr}
            </Stack>
          </Grid>
          <Grid item xs={4}>
            <Grid container sx={{ alignItems: "center", justifyContent: "center" }}>
              {lightImg}
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions>
        <IconButton aria-label="fullscreen" onClick={() => enterFullScreen()}><FullscreenIcon /></IconButton>
        {deleteButton}
      </CardActions>
    </Card>
  )
}
