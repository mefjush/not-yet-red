"use client"

import TrafficLight from '../domain/TrafficLight'
import LightConfig, { LightSettings } from '../domain/LightConfig'
import { Card, CardActions, CardContent, Box, Menu, MenuItem, ListItemIcon, ListItemText, Stack, IconButton } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { StatePicker } from './PhaseControls'
import LightHead from './LightHead'
import React from 'react'
import Timeline from './Timeline'
import ShareIcon from '@mui/icons-material/Share'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import AddIcon from '@mui/icons-material/Add'
import LightUiState from '../domain/LightUiState'

export type LightRecord = {
  light: TrafficLight
  lightConfig: LightConfig
  onLightSettingsChange: (lightSettings: LightSettings) => void, 
  setExpanded: () => void, 
}

export default function LightGroup({ 
  currentTimestamp,
  lightUiState,
  setLightUiState,
  onDelete,
  onFullscreen, 
  onShare,
  onAdd,
  lightRecords
}: { 
  currentTimestamp: number,
  lightUiState: LightUiState
  setLightUiState: (lightUiState: LightUiState) => void,
  onDelete: () => void, 
  onFullscreen: () => void, 
  onShare: () => void, 
  onAdd: () => void,
  lightRecords: LightRecord[]
}) {

  const [moreMenuAnchor, setMoreMenuAnchor] = React.useState<null | HTMLElement>(null)

  const moreMenuOpen = Boolean(moreMenuAnchor)

  const lightHeads = lightRecords.map(({ light, lightConfig, onLightSettingsChange, setExpanded }, idx) => {
    const head = (
      <LightHead 
        currentTimestamp={currentTimestamp} 
        light={light} 
        lightConfig={lightConfig} 
        maxHeight={ 100 } 
        maxWidth={ 1000 } 
      />
    )

    const sx = {
      borderRadius: 0,
      '.MuiTouchRipple-ripple .MuiTouchRipple-child': {
        borderRadius: 0
      },
    }

    return (
      <IconButton key={idx} onClick={setExpanded} sx={sx}>
        {head}
      </IconButton>
    )
  })
  
  const timelines = lightRecords.map(({ light, lightConfig, onLightSettingsChange, setExpanded }, idx) => {
    return (
      <Timeline
        key={idx}
        currentTimestamp={currentTimestamp} 
        lightConfig={lightConfig} 
        onLightSettingsChange={onLightSettingsChange} 
        selectedState={lightUiState.selectedState}
        editable={true}
      />
    )
  })

  const onMenuClose = () => setMoreMenuAnchor(null)

  const bottomActions = (
    <CardActions>
      <Box sx={{ ml: 1 }}>
        <StatePicker
          states={[...new Set(lightRecords.flatMap(lr => lr.lightConfig.phases).map(phase => phase.state))]}
          setSelectedState={(state) => setLightUiState(lightUiState.withSelectedState(state))}
          selectedState={lightUiState.selectedState}
        />
      </Box>

      <IconButton
        style={{ marginLeft: 'auto' }}
        aria-label="more"
        id="basic-button"
        aria-controls={moreMenuOpen ? 'basic-menu' : undefined}
        aria-expanded={moreMenuOpen ? 'true' : undefined}
        aria-haspopup="true"
        onClick={(event) => setMoreMenuAnchor(event.currentTarget)}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="basic-menu"
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        anchorEl={moreMenuAnchor}
        open={moreMenuOpen}
        onClose={onMenuClose}
      >
        {/* <MenuItem 
          onClick={() => {
            onMenuClose()
            onShare()
          }}
        >
          <ListItemIcon>
            <ShareIcon />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem> */}
        {/* <MenuItem 
          onClick={() => {
            onMenuClose()
            onFullscreen()
          }}
        >
          <ListItemIcon>
            <FullscreenIcon />
          </ListItemIcon>
          <ListItemText>Fullscreen</ListItemText>
        </MenuItem> */}
        <MenuItem 
          onClick={() => {
            onMenuClose()
            onDelete()
          }}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            onMenuClose()
            onAdd()
          }}
        >
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText>Add</ListItemText>
        </MenuItem>
      </Menu>
    </CardActions>
  )

  return (
    <>
      <Card>
        <Grid container justifyContent="center" alignItems="center">
          <Stack direction='row' alignItems='flex-end'>
            {lightHeads}
          </Stack>
        </Grid>

        <CardContent>
          <Stack direction='column'>
            {timelines}
          </Stack>
        </CardContent>

        {bottomActions}

      </Card>
    </>
  )
}
