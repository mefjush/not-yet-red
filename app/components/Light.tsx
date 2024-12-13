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
import LightModel from '../domain/LightModel'

export default function LightComponent({ currentTimestamp, light, lightConfig, expanded, onLightSettingsChange, selectionMode, setExpanded, onDelete, onFullscreen, onShare, lightModel }: { currentTimestamp: number, light: TrafficLight, lightConfig: LightConfig, expanded: boolean, onLightSettingsChange: (lightSettings: LightSettings) => void, selectionMode: boolean, setExpanded: () => void, onDelete: () => void, onFullscreen: () => void, onShare: () => void, lightModel: LightModel }) {

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const moreMenuOpen = Boolean(anchorEl)
  
  const selectedState = lightModel.getSelectedState()
  const selected = lightModel.isSelected()

  const lightHead = <LightHead currentTimestamp={currentTimestamp} light={light} lightConfig={lightConfig} height={ expanded ? '150px' : '60px' } />

  const onMenuClose = () => setAnchorEl(null)

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
      onChange={e => lightModel.setSelected(e.target.checked)}
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
          setSelectedState={(state) => lightModel.setSelectedState(state)}
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
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="basic-menu"
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        anchorEl={anchorEl}
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
  const actionFunction = !selectionMode ? setExpanded : (() => lightModel.setSelected(!selected))

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

        {theContent}
        {bottomActions}

      </Card>
    </>
  )
}
