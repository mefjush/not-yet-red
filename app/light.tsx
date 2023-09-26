"use client"

import TrafficLight from './trafficLight'
import LightSettings from './lightSettings'
import Input from './input'
import { IconButton, Card, CardActions, CardContent } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

export default function LightComponent({ index, currentTimestamp, light, lightSettings, onLightSettingsChange, onClone, onDelete }: { index: number, currentTimestamp: number, light: TrafficLight, lightSettings: LightSettings, onLightSettingsChange: (lightSettings: LightSettings) => void, onClone: () => void, onDelete?: () => void}) {

  const offsetId =`light-${index}-offset`
  const redDurationId =`light-${index}-red-duration`

  const deleteButton = onDelete == null ? <></> : <IconButton aria-label="delete" onClick={() => onDelete()}><DeleteIcon /></IconButton>

  const currentPhase = light.currentPhase(currentTimestamp)

  return (
    <div>
      <Card sx={{ m: 1 }}>
        <CardContent>
          <h3 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Light #{index}</h3>
          <form className="space-y-4">
            <Input label="Offset duration" id={offsetId} min={0} value={lightSettings.offset / 1000} onChange={e => onLightSettingsChange({ ...lightSettings, offset: e.target.value * 1000 })} />
            <Input label="Red duration" id={redDurationId} min={2} value={lightSettings.duration.red / 1000} onChange={e => onLightSettingsChange({ ...lightSettings, duration: { ...lightSettings.duration, red: e.target.value * 1000 } })} />
          </form>
          <img src={currentPhase.state.file} alt={currentPhase.state.name} style={{ maxWidth: "100%", maxHeight: "90vh" }}/>
        </CardContent>
        <CardActions>
          {deleteButton}
        </CardActions>
      </Card>

    </div>
  )
}
