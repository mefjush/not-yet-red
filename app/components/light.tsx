"use client"

import TrafficLight from '../domain/traffic-light'
import LightConfig, { LightSettings } from '../domain/light-config'
import Input from './input'
import { IconButton, Card, CardActions, CardContent, Stack } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import { useRef, useState } from 'react'
import { Typography } from '@mui/material'
import Tune from './tune'
import { UiMode } from '../ui-mode'
import { QRCodeSVG } from 'qrcode.react'
import { objectSerDeser } from '../url'

export default function LightComponent({ index, mode, currentTimestamp, light, lightConfig, onLightSettingsChange, onDelete, style }: { index: number, mode: UiMode, currentTimestamp: number, light: TrafficLight, lightConfig: LightConfig, onLightSettingsChange: (lightSettings: LightSettings) => void, onDelete?: () => void, style?: React.CSSProperties}) {

  const lightRef = useRef<HTMLImageElement>(null)

  const [wakeLock, setWakeLock] = useState<WakeLockSentinel|null>(null)

  const deleteButton = onDelete == null ? <></> : <IconButton aria-label="delete" onClick={() => onDelete()} style={{ marginLeft: "auto" }}><DeleteIcon /></IconButton>

  const currentPhase = light.currentPhase(currentTimestamp)

  const lightImg = <img className="the-traffic-light" ref={lightRef} src={currentPhase.state.file} alt={currentPhase.state.name} style={{ margin: "0 auto", width: "220px", maxWidth: "100%", maxHeight: "90vh" }}/>
  const tune = <Tune lightConfig={lightConfig} onLightSettingsChange={onLightSettingsChange}/>

  const search = `?crossingSettings=${objectSerDeser().serialize(lightConfig.crossingSettings)}&lightSettings=${objectSerDeser().serialize([lightConfig.toLightSettings()])}`

  const baseUrl = typeof window === "undefined" ? process.env.NEXT_PUBLIC_SITE_URL : window.location.origin
  // const baseUrl = "http://192.168.0.106:3000" 
  const url = baseUrl + search

  console.log("Rendering light @ " + currentTimestamp)

  const qr = mode.qr ? <div style={{ margin: "auto auto" }}><QRCodeSVG size={256} value={url}/></div> : <></>
    
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
  
  const enterFullScreen = function() {
    requestWakeLock()
    lightRef.current?.requestFullscreen().finally(() => releaseWakeLock())
  }

  return (
    <Card sx={{ m: 1, minWidth: 250 }} style={style}>
      <CardContent>
        <Typography sx={{ fontSize: 14, mb: 1.5 }} color="text.secondary" gutterBottom>
          Light #{index} {currentTimestamp}
        </Typography>
        <form>
          <Input label="Offset duration" id={`light-${index}-offset`} min={0} max={(lightConfig.cycleLength() / 1000) - 1} value={lightConfig.offset / 1000} onChange={e => onLightSettingsChange(lightConfig.withOffset(e.target.value * 1000))} />
          <Input label="Red duration" id={`light-${index}-red-duration`} min={0} max={lightConfig.cycleLength() / 1000} value={lightConfig.duration.red / 1000} onChange={e => onLightSettingsChange(lightConfig.withRedDuration(e.target.value * 1000))} />
        </form>
        <Stack direction="column" alignItems="stretch">
          {tune}
          {qr}
          {lightImg}
        </Stack>
      </CardContent>
      <CardActions>
        <IconButton aria-label="fullscreen" onClick={() => enterFullScreen()}><FullscreenIcon /></IconButton>
        {deleteButton}
      </CardActions>
    </Card>
  )
}
