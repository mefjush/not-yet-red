"use client"

import TrafficLight from '../domain/traffic-light'
import LightConfig, { LightSettings, PresetId, PRESETS } from '../domain/light-config'
import { IconButton, Card, CardActions, CardContent, Stack, Collapse, Typography, Checkbox, Select, MenuItem, RadioGroup, FormControlLabel, Radio, Box, CardActionArea, FormControl } from '@mui/material'
import Grid from '@mui/material/Grid2'
import DeleteIcon from '@mui/icons-material/Delete'
import ShareIcon from '@mui/icons-material/Share'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useState } from 'react'
import { ExpandMore } from './expand-more'
import PhaseControls, { PhaseControl } from './phase-controls'
import LightIcon from './light-icon'
import React from 'react'
import { State } from '../domain/state'
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import EditIcon from '@mui/icons-material/Edit'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import CloseIcon from '@mui/icons-material/Close'
import Slide from '@mui/material/Slide'
import { TransitionProps } from '@mui/material/transitions'
import Timeline from './timeline'
import LightSettingsComponent from './light-settings'

export default function LightComponent({ index, currentTimestamp, light, lightConfig, selected, onLightSettingsChange, onDelete, onSelectionChange, onFullscreen, onShare }: { index: number, currentTimestamp: number, light: TrafficLight, lightConfig: LightConfig, selected: boolean, onLightSettingsChange: (lightSettings: LightSettings) => void, onDelete?: () => void, onSelectionChange: (b: boolean) => void, onFullscreen: () => void, onShare: () => void }) {

  const [expanded, setExpanded] = useState(false)
  const [selectedState, setSelectedState] = useState(State.RED)
  
  const handleExpandClick = () => {
    setExpanded(!expanded);
  }

  const effectivelyExpanded = expanded

  const deleteButton = onDelete == null ? <></> : <IconButton aria-label="delete" onClick={() => onDelete()}><DeleteIcon /></IconButton>

  const lightIcon = <LightIcon currentTimestamp={currentTimestamp} light={light} lightConfig={lightConfig} height={ effectivelyExpanded ? '150px' : '60px' } />

  const quickEditControls = (
    <PhaseControls
      lightConfig={lightConfig}
      onLightSettingsChange={onLightSettingsChange}
      setSelectedState={setSelectedState}
      selectedState={selectedState}
      expanded={effectivelyExpanded}
    />
  )

  const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
      children: React.ReactElement<unknown>
    },
    ref: React.Ref<unknown>,
  ) {
    return <Slide direction="up" ref={ref} {...props} />
  })

  const handleClose = () => setExpanded(false)

  const theCard = (
    <Card>
      <CardActions>
        { effectivelyExpanded || <Checkbox value={selected} checked={selected} onChange={e => onSelectionChange(e.target.checked)}/>}
        { effectivelyExpanded && <IconButton aria-label="fullscreen" onClick={onFullscreen}><FullscreenIcon /></IconButton>}
        { effectivelyExpanded && <IconButton aria-label="share" onClick={onShare}><ShareIcon /></IconButton>}
        { effectivelyExpanded && deleteButton }
        <ExpandMore
          expand={effectivelyExpanded}
          onClick={handleExpandClick}
          aria-expanded={effectivelyExpanded}
          aria-label="show more"
          style={{marginLeft: 'auto'}}
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>

      <CardContent>
        <Grid container sx={{ justifyContent: "space-between", alignItems: "center", mb: 4 }} spacing={0}>
          <CardActionArea onClick={() => setExpanded(!expanded)}>
            <Grid size={{ xs: 12 }} display="flex" justifyContent="center" alignItems="center">
              {lightIcon}
            </Grid>
          </CardActionArea>
          <Grid size={{ xs: 12 }}>
            <Stack direction="column" alignItems="stretch">
              <Box sx={{ mt: 2 }}>
                <Timeline 
                  currentTimestamp={currentTimestamp} 
                  lightConfig={lightConfig} 
                  onLightSettingsChange={onLightSettingsChange} 
                  selectedState={selectedState}
                />
              </Box>
            </Stack>
          </Grid>
        </Grid>

        { expanded ? null : quickEditControls }
        
        {/* <Collapse in={effectivelyExpanded} timeout="auto" unmountOnExit>
          <LightSettingsComponent
            lightConfig={lightConfig}
            onLightSettingsChange={onLightSettingsChange}
            setSelectedState={setSelectedState}
            selectedState={selectedState}
          />
        </Collapse> */}
      </CardContent>
    </Card>
  )

  return (
    <>
      {theCard}
      <Dialog
        fullScreen
        open={effectivelyExpanded}
        onClose={handleClose}
        // TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Sound
            </Typography>
            <Button autoFocus color="inherit" onClick={handleClose}>
              save
            </Button>
          </Toolbar>
        </AppBar>
        
        <Grid container sx={{ justifyContent: "space-between", alignItems: "center", mb: 4 }} spacing={0}>
          <Grid size={{ xs: 12 }} display="flex" justifyContent="center" alignItems="center">
            {lightIcon}
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Stack direction="column" alignItems="stretch">
              <Box sx={{ mt: 2 }}>
                <Timeline 
                  currentTimestamp={currentTimestamp} 
                  lightConfig={lightConfig} 
                  onLightSettingsChange={onLightSettingsChange} 
                  selectedState={selectedState}
                />
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <LightSettingsComponent
          lightConfig={lightConfig}
          onLightSettingsChange={onLightSettingsChange}
          setSelectedState={setSelectedState}
          selectedState={selectedState}
        />
      </Dialog>
    </>
    
  )
}
