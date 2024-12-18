"use client"

import TrafficLight from '../domain/TrafficLight'
import LightConfig, { LightSettings } from '../domain/LightConfig'
import { IconButton, Card, CardActions, CardContent, Checkbox, Box, CardActionArea, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
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
import { UiMode } from './Intersection'

export default function LightComponent({ 
  currentTimestamp, 
  light, 
  lightConfig, 
  expanded, 
  checkboxMode, 
  lightUiState, 
  onLightSettingsChange, 
  setExpanded, 
  onDelete, 
  onFullscreen, 
  onShare, 
  setLightUiState 
}: { 
  currentTimestamp: number, 
  light: TrafficLight, 
  lightConfig: LightConfig, 
  expanded: boolean, 
  checkboxMode: UiMode, 
  lightUiState: LightUiState, 
  onLightSettingsChange: (lightSettings: LightSettings) => void, 
  setExpanded: () => void, 
  onDelete: () => void, 
  onFullscreen: () => void, 
  onShare: () => void, 
  setLightUiState: (lightUiState: LightUiState) => void 
}) {

  const [moreMenuAnchor, setMoreMenuAnchor] = React.useState<null | HTMLElement>(null)

  const moreMenuOpen = Boolean(moreMenuAnchor)
  const selectedState = lightUiState.selectedState
  const selected = lightUiState.isSelected

  const lightHead = <LightHead currentTimestamp={currentTimestamp} light={light} lightConfig={lightConfig} maxHeight={ expanded ? 200 : 100 } maxWidth={ 1000 } />

  const onMenuClose = () => setMoreMenuAnchor(null)

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
      <ZoomInIcon />
    </IconButton>
  )

  const checkbox = (
    <Checkbox 
      value={selected} 
      checked={selected}
      onClick={e => e.stopPropagation()}
      onChange={e => setLightUiState(lightUiState.withSelected(e.target.checked))}
      onTouchStart={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    />
  )

  const bottomActions = (
    <CardActions>
      <Box sx={{ ml: 1 }}>
        <PhaseControls
          lightConfig={lightConfig}
          onLightSettingsChange={onLightSettingsChange}
          setSelectedState={(state) => setLightUiState(lightUiState.withSelectedState(state))}
          selectedState={selectedState}
          expanded={expanded}
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

  const actionIcon = checkboxMode == 'none' ? editButton : checkbox
  const actionFunction = checkboxMode == 'none' ? setExpanded : (() => setLightUiState(lightUiState.withSelected(!selected)))

  return (
    <>
      <Card>
        <CardActionArea disabled={false} component="a" onClick={actionFunction}>
          <CardActions disableSpacing sx={{ alignItems: 'flex-start' }}>
            {actionIcon}
            <Box style={{ marginLeft: 'auto' }}>{lightHead}</Box>
            <Box style={{ marginLeft: 'auto', visibility: 'hidden' }}>{editButton}</Box> 
          </CardActions>
        </CardActionArea> 

        <CardContent>
          <Timeline 
            currentTimestamp={currentTimestamp} 
            lightConfig={lightConfig} 
            onLightSettingsChange={onLightSettingsChange} 
            selectedState={selectedState}
            editable={true}
          />
        </CardContent>

        {bottomActions}

      </Card>
    </>
  )
}
