"use client"

import TrafficLight from '../domain/TrafficLight'
import LightConfig, { LightSettings } from '../domain/LightConfig'
import { Card, CardActions, CardContent, Checkbox, Box, CardActionArea, Menu, MenuItem, ListItemIcon, ListItemText, Stack, Button, IconButton } from '@mui/material'
import Grid from '@mui/material/Grid2'
import PhaseControls from './PhaseControls'
import LightHead from './LightHead'
import React from 'react'
import Timeline from './Timeline'
import ShareIcon from '@mui/icons-material/Share'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import DeleteIcon from '@mui/icons-material/Delete'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import LightUiState from '../domain/LightUiState'

type LightRecord = {
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
  lightRecords
}: { 
  currentTimestamp: number,
  lightUiState: LightUiState
  setLightUiState: (lightUiState: LightUiState) => void,
  onDelete: () => void, 
  onFullscreen: () => void, 
  onShare: () => void, 
  lightRecords: LightRecord[]
}) {

  const [moreMenuAnchor, setMoreMenuAnchor] = React.useState<null | HTMLElement>(null)

  const moreMenuOpen = Boolean(moreMenuAnchor)

  const lightHeads = lightRecords.map(({ light, lightConfig, onLightSettingsChange, setExpanded }) => {
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
        borderRadius: 0,
        backgroundColor: 'red',
      },
    }

    return (
      <IconButton onClick={setExpanded} sx={sx}>
        {head}
      </IconButton>
    )
  })
  
  const timelines = lightRecords.map(({ light, lightConfig, onLightSettingsChange, setExpanded }) => {
    return (
      <Timeline 
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
        <PhaseControls
          lightConfig={lightRecords[0].lightConfig}
          onLightSettingsChange={(foo) => {}}
          setSelectedState={(state) => setLightUiState(lightUiState.withSelectedState(state))}
          selectedState={lightUiState.selectedState}
          expanded={false}
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
        <MenuItem 
          onClick={() => {
            onMenuClose()
            onShare()
          }}
        >
          <ListItemIcon>
            <ShareIcon />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            onMenuClose()
            onFullscreen()
          }}
        >
          <ListItemIcon>
            <FullscreenIcon />
          </ListItemIcon>
          <ListItemText>Fullscreen</ListItemText>
        </MenuItem>
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
