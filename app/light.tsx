"use client"

import TrafficLight from './trafficLight'
import LightConfig from './lightConfig'
import Input from './input'
import { IconButton, Card, CardActions, CardContent, Box } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import { useRef } from 'react'
import { Typography } from '@mui/material'
import Tune from './tune'
import { Stack } from '@mui/material'
import { UiMode } from './uiMode'

export default function LightComponent({ index, mode, currentTimestamp, light, lightConfig, onLightSettingsChange, onDelete, style }: { index: number, mode: UiMode, currentTimestamp: number, light: TrafficLight, lightConfig: LightConfig, onLightSettingsChange: (lightSettings: LightSettings) => void, onDelete?: () => void, style?: React.CSSProperties}) {

  const lightRef = useRef(null);

  const deleteButton = onDelete == null ? <></> : <IconButton aria-label="delete" onClick={() => onDelete()} style={{ marginLeft: "auto" }}><DeleteIcon /></IconButton>

  const currentPhase = light.currentPhase(currentTimestamp)

  const lightImg = <img className="the-traffic-light" ref={lightRef} src={currentPhase.state.file} alt={currentPhase.state.name} style={{ marginLeft: "auto", width: "220px", maxWidth: "100%", maxHeight: "90vh" }}/>
  const tune = <Tune lightConfig={lightConfig}/>
  const theLight = mode == UiMode.LIGHTS ? lightImg : tune

  return (
    <Card sx={{ m: 1, minWidth: 250 }} style={style}>
      <CardContent>
        <Typography sx={{ fontSize: 14, mb: 1.5 }} color="text.secondary" gutterBottom>
          Light #{index}
        </Typography>
        <form>
          <Input label="Offset duration" id={`light-${index}-offset`} min={0} max={lightConfig.cycleLength() / 1000} value={lightConfig.offset / 1000} onChange={e => onLightSettingsChange(lightConfig.withOffset(e.target.value * 1000))} />
          <Input label="Red duration" id={`light-${index}-red-duration`} min={0} max={lightConfig.cycleLength() / 1000} value={lightConfig.duration.red / 1000} onChange={e => onLightSettingsChange(lightConfig.withRedDuration(e.target.value * 1000))} />
        </form>
        {theLight}
      </CardContent>
      <CardActions>
        <IconButton aria-label="fullscreen" onClick={() => lightRef.current.requestFullscreen()}><FullscreenIcon /></IconButton>
        {deleteButton}
      </CardActions>
    </Card>
  )
}
