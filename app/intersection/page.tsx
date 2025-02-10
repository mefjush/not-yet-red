"use client"

import {
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import ShareIcon from "@mui/icons-material/Share"
import FullscreenIcon from "@mui/icons-material/Fullscreen"
import IntersectionComponent, { UiMode } from "../components/Intersection"
import MenuIcon from "@mui/icons-material/Menu"
import { useState } from "react"
import { MENU_ITEMS } from "../components/MenuItems"
import AppToolbar from "../components/AppToolbar"
import AnimatedLogo from "../components/AnimatedLogo"

function Content() {
  const [uiMode, setUiMode] = useState<UiMode>("none")
  const [drawerOpen, setDrawerOpen] = useState(false)

  const buttonAction = (uiMode: UiMode) => {
    return () => {
      setUiMode(uiMode)
    }
  }

  const toolbarElements = (
    <>
      <IconButton
        size="large"
        edge="start"
        color="inherit"
        onClick={() => setDrawerOpen(true)}
      >
        <MenuIcon />
      </IconButton>

      <Box sx={{ flexGrow: 1 }}></Box>

      <AnimatedLogo />

      <Box sx={{ flexGrow: 1 }}></Box>

      <IconButton
        size="large"
        color="inherit"
        aria-label="share"
        onClick={buttonAction("share")}
      >
        <ShareIcon />
      </IconButton>

      <IconButton
        size="large"
        color="inherit"
        aria-label="fullscreen"
        edge="end"
        onClick={buttonAction("fullscreen")}
      >
        <FullscreenIcon />
      </IconButton>
    </>
  )

  const drawerList = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={() => setDrawerOpen(false)}
    >
      <List>
        {MENU_ITEMS.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton href={item.href}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <>
      <AppToolbar>{toolbarElements}</AppToolbar>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {drawerList}
      </Drawer>
      <IntersectionComponent uiMode={uiMode} setUiMode={setUiMode} />
    </>
  )
}

export default function Home() {
  return (
    <main>
      <Content />
    </main>
  )
}
