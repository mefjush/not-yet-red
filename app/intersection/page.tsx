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
  Tooltip,
  Toolbar,
} from "@mui/material"
import ShareIcon from "@mui/icons-material/IosShare"
import FullscreenIcon from "@mui/icons-material/Fullscreen"
import IntersectionComponent, { UiMode } from "../components/Intersection"
import MenuIcon from "@mui/icons-material/Menu"
import { Suspense, useState } from "react"
import { MENU_ITEMS } from "../components/MenuItems"
import AppToolbar from "../components/AppToolbar"
import AnimatedLogo from "../components/AnimatedLogo"

function Content() {
  const [uiMode, setUiMode] = useState<UiMode>("none")
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <AppToolbar>
        <IconButton size="large" edge="start" aria-label="Menu" onClick={() => setDrawerOpen(true)}>
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
          <AnimatedLogo />
        </Box>

        <Tooltip title="Share with other phones">
          <IconButton size="large" aria-label="Share" onClick={() => setUiMode("share")}>
            <ShareIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Go fullscreen">
          <IconButton
            size="large"
            aria-label="Fullscreen"
            edge="end"
            onClick={() => setUiMode("fullscreen")}
          >
            <FullscreenIcon />
          </IconButton>
        </Tooltip>
      </AppToolbar>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          <Toolbar>
            <AnimatedLogo />
          </Toolbar>
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
      </Drawer>

      <Suspense>
        <IntersectionComponent uiMode={uiMode} setUiMode={setUiMode} />
      </Suspense>
    </>
  )
}

export default function Home() {
  return (
    <main style={{ minHeight: "100vh" }}>
      <Content />
    </main>
  )
}
