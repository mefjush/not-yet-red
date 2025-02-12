"use client"

import TrafficLight from "../domain/TrafficLight"
import LightConfig, { LightSettings } from "../domain/LightConfig"
import {
  Card,
  CardActions,
  CardContent,
  Box,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CardActionArea,
} from "@mui/material"
import Grid from "@mui/material/Grid2"
import { StatePicker } from "./PhaseControls"
import LightHead from "./LightHead"
import React from "react"
import Timeline from "./Timeline"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import DeleteIcon from "@mui/icons-material/Delete"
import MoveUpIcon from "@mui/icons-material/MoveUp"
import MoveDownIcon from "@mui/icons-material/MoveDown"
import { State } from "../domain/State"

export default function LightCard({
  currentTimestamp,
  selectedState,
  setSelectedState,
  onDelete,
  onMove,
  light,
  lightConfig,
  expanded,
  onLightSettingsChange,
  setExpanded,
}: {
  currentTimestamp: number
  selectedState: State
  setSelectedState: (state: State) => void
  onDelete: () => void
  onMove: (amount: number) => void
  light: TrafficLight
  lightConfig: LightConfig
  expanded: boolean
  onLightSettingsChange: (lightSettings: LightSettings) => void
  setExpanded: (expanded: boolean) => void
}) {

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null,
  )

  const menuOpen = Boolean(menuAnchorEl)

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchorEl(null)
  }

  const head = (
    <LightHead
      currentTimestamp={currentTimestamp}
      light={light}
      lightConfig={lightConfig}
      maxHeight={100}
      maxWidth={1000}
    />
  )

  const timeline = (
    <Timeline
      currentTimestamp={currentTimestamp}
      lightConfig={lightConfig}
      onLightSettingsChange={onLightSettingsChange}
      selectedState={selectedState}
      editable={true}
    />
  )

  return (
    <Card>
      <CardActionArea onClick={() => setExpanded(!expanded)} sx={{ py: 1 }}>
        <Grid
          size={{ xs: 12 }}
          display="flex"
          justifyContent="center"
          alignItems="flex-start"
        >
          {head}
        </Grid>
      </CardActionArea>

      <CardContent>
        <Stack direction="column">{timeline}</Stack>
      </CardContent>

      <CardActions disableSpacing>
        <Box sx={{ ml: 1 }}>
          <StatePicker
            states={lightConfig.phases.map((phase) => phase.state)}
            setSelectedState={setSelectedState}
            selectedState={selectedState}
          />
        </Box>
        <IconButton sx={{ ml: "auto" }} onClick={handleMenuClick}>
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="basic-menu"
          anchorEl={menuAnchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose()
              onMove(-1)
            }}
          >
            <ListItemIcon>
              <MoveUpIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Move up</ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleMenuClose()
              onMove(1)
            }}
          >
            <ListItemIcon>
              <MoveDownIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Move down</ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleMenuClose()
              onDelete()
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </CardActions>
    </Card>
  )
}
