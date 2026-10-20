"use client"

import TrafficLight from "../domain/TrafficLight"
import LightConfig from "../domain/LightConfig"
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CardActionArea,
  Divider,
  ListSubheader,
  Tooltip,
} from "@mui/material"
import { StatePicker } from "./PhaseControls"
import LightHead from "./LightHead"
import React from "react"
import Timeline from "./Timeline"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import SmartphoneIcon from "@mui/icons-material/Smartphone"
import AddToHomeScreenIcon from "@mui/icons-material/AddToHomeScreen"
import { State } from "../domain/State"

export default function LightCard({
  index,
  phoneIdx,
  phoneCount,
  aloneOnPhone,
  canMoveUp,
  canMoveDown,
  currentTimestamp,
  selectedState,
  setSelectedState,
  onDelete,
  onMove,
  onMoveToPhone,
  light,
  lightConfig,
  expanded,
  onLightConfigChange,
  setExpanded,
}: {
  index: number
  phoneIdx: number
  phoneCount: number
  aloneOnPhone: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  currentTimestamp: number
  selectedState: State
  setSelectedState: (state: State) => void
  onDelete: () => void
  onMove: (amount: number) => void
  onMoveToPhone: (phoneIdx: number) => void
  light: TrafficLight
  lightConfig: LightConfig
  expanded: boolean
  onLightConfigChange: (lightConfig: LightConfig) => void
  setExpanded: (expanded: boolean) => void
}) {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null)

  const closeMenuAnd = (action: () => void) => () => {
    setMenuAnchorEl(null)
    action()
  }

  return (
    <Card>
      <CardHeader
        title={`Light ${index + 1}`}
        subheader={lightConfig.preset.name}
        slotProps={{ title: { variant: "subtitle1", fontWeight: 600 } }}
        sx={{ pb: 0 }}
        action={
          <>
            <Tooltip title="Edit light">
              <IconButton aria-label="Edit light" onClick={() => setExpanded(!expanded)}>
                <EditOutlinedIcon />
              </IconButton>
            </Tooltip>
            <IconButton aria-label="More actions" onClick={(e) => setMenuAnchorEl(e.currentTarget)}>
              <MoreVertIcon />
            </IconButton>
          </>
        }
      />

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
      >
        <MenuItem disabled={!canMoveUp} onClick={closeMenuAnd(() => onMove(-1))}>
          <ListItemIcon>
            <ArrowUpwardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Move up</ListItemText>
        </MenuItem>
        <MenuItem disabled={!canMoveDown} onClick={closeMenuAnd(() => onMove(1))}>
          <ListItemIcon>
            <ArrowDownwardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Move down</ListItemText>
        </MenuItem>
        <Divider />
        <ListSubheader sx={{ lineHeight: 2.5, bgcolor: "transparent" }}>Move to</ListSubheader>
        {Array.from({ length: phoneCount }, (_, idx) => (
          <MenuItem
            key={idx}
            disabled={idx == phoneIdx}
            onClick={closeMenuAnd(() => onMoveToPhone(idx))}
          >
            <ListItemIcon>
              <SmartphoneIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Phone {idx + 1}</ListItemText>
          </MenuItem>
        ))}
        <MenuItem disabled={aloneOnPhone} onClick={closeMenuAnd(() => onMoveToPhone(phoneCount))}>
          <ListItemIcon>
            <AddToHomeScreenIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>New phone</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={closeMenuAnd(onDelete)} sx={{ color: "error.main" }}>
          <ListItemIcon sx={{ color: "inherit" }}>
            <DeleteOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <CardActionArea
        onClick={() => setExpanded(!expanded)}
        aria-label={`Edit light ${index + 1}`}
        sx={{ display: "flex", justifyContent: "center", py: 1 }}
      >
        <LightHead
          currentTimestamp={currentTimestamp}
          light={light}
          lightConfig={lightConfig}
          maxHeight={100}
          maxWidth={1000}
        />
      </CardActionArea>

      <CardContent sx={{ pt: 0 }}>
        <Timeline
          currentTimestamp={currentTimestamp}
          lightConfig={lightConfig}
          onLightConfigChange={onLightConfigChange}
          selectedState={selectedState}
          editable={true}
        />
        <StatePicker
          phases={lightConfig.phases}
          preset={lightConfig.preset}
          setSelectedState={setSelectedState}
          selectedState={selectedState}
        />
      </CardContent>
    </Card>
  )
}
