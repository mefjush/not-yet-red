"use client"

import TrafficLight from '../domain/traffic-light'
import LightConfig, { LightSettings } from '../domain/light-config'
import { IconButton, Card, CardActions, CardContent, Checkbox, Box, CardActionArea } from '@mui/material'
import { useState } from 'react'
import PhaseControls from './phase-controls'
import LightIcon from './light-icon'
import React from 'react'
import { State } from '../domain/state'
import EditIcon from '@mui/icons-material/Edit'
import Timeline from './timeline'
import DeleteIcon from '@mui/icons-material/Delete'

export default function LightComponent({ currentTimestamp, light, lightConfig, selected, expanded, onLightSettingsChange, onSelectionChange, selectionMode, setExpanded, onDelete }: { currentTimestamp: number, light: TrafficLight, lightConfig: LightConfig, selected: boolean, expanded: boolean, onLightSettingsChange: (lightSettings: LightSettings) => void, onSelectionChange: (b: boolean) => void, selectionMode: boolean, setExpanded: () => void, onDelete?: () => void }) {

  const [selectedState, setSelectedState] = useState(State.RED)
  
  const lightIcon = <LightIcon currentTimestamp={currentTimestamp} light={light} lightConfig={lightConfig} height={ expanded ? '150px' : '60px' } />

  const quickEditControls = (
    <PhaseControls
      lightConfig={lightConfig}
      onLightSettingsChange={onLightSettingsChange}
      setSelectedState={setSelectedState}
      selectedState={selectedState}
      expanded={expanded}
    />
  )

  const editButton = (
    <IconButton 
      disabled={false}
      aria-label="edit" 
      onTouchStart={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    
      onClick={(event) => {
        // Prevent CardActionArea Click
        event.preventDefault()
        setExpanded()
      }}
    >
      <EditIcon />
    </IconButton>
  )

  const checkbox = (
    <Checkbox 
      value={selected} 
      checked={selected}
      onClick={e => e.stopPropagation()}
      onChange={e => {
        onSelectionChange(e.target.checked)
      }}
      onTouchStart={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    />
  )

  const bottomActions = (
    <CardActions>
      <Box sx={{ ml: 1 }}>
        {quickEditControls}
      </Box>
      <IconButton 
        style={{ marginLeft: 'auto' }}
        onClick={onDelete}
      >
        <DeleteIcon />
      </IconButton>
    </CardActions>
  )

  const theContent = (
    <CardContent>
      <Timeline 
        currentTimestamp={currentTimestamp} 
        lightConfig={lightConfig} 
        onLightSettingsChange={onLightSettingsChange} 
        selectedState={selectedState}
        editable={true}
      />
    </CardContent>
  ) 

  const actionIcon = !selectionMode ? editButton : checkbox
  const actionFunction = !selectionMode ? setExpanded : (() => onSelectionChange(!selected))

  return (
    <>
      <Card>
        <CardActionArea disabled={false} component="a" onClick={actionFunction}>
          <CardActions disableSpacing sx={{ alignItems: 'flex-start' }}>
            {actionIcon}
            <Box style={{ marginLeft: 'auto' }}>{lightIcon}</Box>
            <Box style={{ marginLeft: 'auto', visibility: 'hidden' }}>{editButton}</Box> 
          </CardActions>
        </CardActionArea> 

        {theContent}
        {bottomActions}

      </Card>
    </>
  )
}
