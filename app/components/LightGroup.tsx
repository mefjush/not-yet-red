"use client"

import TrafficLight from '../domain/TrafficLight'
import LightConfig, { LightSettings } from '../domain/LightConfig'
import { Card, CardActions, CardContent, Box, Menu, MenuItem, ListItemIcon, ListItemText, Stack, IconButton } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { StatePicker } from './PhaseControls'
import LightHead from './LightHead'
import React, { ReactElement } from 'react'
import Timeline from './Timeline'
import ShareIcon from '@mui/icons-material/Share'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import AddIcon from '@mui/icons-material/Add'
import LightUiState from '../domain/LightUiState'
import MergeIcon from '@mui/icons-material/Merge'
import CallSplitIcon from '@mui/icons-material/CallSplit'
import ExpandIcon from '@mui/icons-material/Expand'
import { group } from 'console'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import CloseIcon from '@mui/icons-material/Close'

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
  onGroup,
  onUngroup,
  onAdd,
  lightRecords
}: { 
  currentTimestamp: number,
  lightUiState: LightUiState
  setLightUiState: (lightUiState: LightUiState) => void,
  onDelete: () => void, 
  onFullscreen: () => void, 
  onShare: () => void,
  onGroup: [() => void, () => void]
  onUngroup: (splitIdx: number) => void,
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
{/* 
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
            onGroup[0]()
          }}
        >
          <ListItemIcon>
            <MergeIcon />
          </ListItemIcon>
          <ListItemText>Group up</ListItemText>
        </MenuItem>

        <MenuItem 
          onClick={() => {
            onMenuClose()
            onUngroup()
          }}
        >
          <ListItemIcon>
            <CallSplitIcon />
          </ListItemIcon>
          <ListItemText>Ungroup</ListItemText>
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
      </Menu> */}
    </CardActions>
  )

  const paddingLeft = 10
  const borderLeft = '5px solid rgb(146, 146, 146)'

  const cards: ReactElement[] = lightRecords.map((_, idx) =>
    <Card>
      <CardActions>
        <IconButton style={{ marginLeft: 'auto' }} onClick={onAdd}>
          <AddIcon/>
        </IconButton>
      </CardActions>

      <Grid container justifyContent="center" alignItems="center">
        <Stack direction='row' alignItems='flex-end'>
          {lightHeads[idx]}
        </Stack>
      </Grid>

      <CardContent>
        <Stack direction='column'>
          {timelines[idx]}
        </Stack>
      </CardContent>

      {bottomActions}

    </Card>
  )


  const groupBtnStyle = { padding: 0, margin: '0 0 0 -16px' }

  const splitButton = (idx: number): ReactElement => (
    <Box style={{ marginLeft: '-32px' }}>
      <IconButton onClick={() => onUngroup(idx)}>
        <CloseIcon/>
      </IconButton>
    </Box>
  )
  
  const items: ReactElement[] = cards.flatMap((card, idx) => [card, splitButton(idx)]).slice(0, -1)

  return (
    <>
      <Box style={groupBtnStyle}>
        <IconButton onClick={onGroup[0]}>
          <ArrowDropUpIcon/>
        </IconButton>
      </Box>
      <Stack sx={{ marginTop: 0, padding: `0 0 0 ${paddingLeft}px`, borderLeft: borderLeft }} spacing={2}>
        {items}
      </Stack>
      <Box style={groupBtnStyle}>
        <IconButton onClick={onGroup[1]}>
          <ArrowDropDownIcon/>
        </IconButton>
      </Box>
    </>
  )
}
