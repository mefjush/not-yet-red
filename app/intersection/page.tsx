"use client"

import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  Stack,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Link,
} from "@mui/material"
import ShareIcon from "@mui/icons-material/Share"
import FullscreenIcon from "@mui/icons-material/Fullscreen"
import IntersectionComponent, { UiMode } from "../components/Intersection"
import MenuIcon from "@mui/icons-material/Menu"
import { Suspense, useState } from "react"
import TrafficIcon from "@mui/icons-material/Traffic"
import styled, { keyframes } from "styled-components"
import { green, yellow, red } from "@mui/material/colors"
import { MENU_ITEMS } from "../components/MenuItems"

const colorFadeSpan = (phase: number) => {
  const colors = keyframes`
    ${0}%   { color: ${phase == 0 ? green[500] : "inherit"}; }
    ${5}%   { color: ${phase == 0 ? green[500] : "inherit"}; }
    ${6}%   { color: ${phase == 1 ? yellow[500] : "inherit"}; }
    ${11}%  { color: ${phase == 1 ? yellow[500] : "inherit"}; }
    ${12}%  { color: ${phase == 2 ? red[500] : "inherit"}; }
    ${99}%  { color: ${phase == 2 ? red[500] : "inherit"}; }
    ${100}% { color: ${phase == 0 ? green[500] : "inherit"}; }
  `

  return styled.span`
    animation: 25s ${colors} infinite linear;
  `
}

const FadeGreen = colorFadeSpan(0)
const FadeYellow = colorFadeSpan(1)
const FadeRed = colorFadeSpan(2)

const HoverContainer = styled.div`
  &:hover {
    ${FadeGreen} {
      color: ${green[500]};
      animation: none;
    }
    ${FadeYellow} {
      color: ${yellow[500]};
      animation: none;
    }
    ${FadeRed} {
      color: ${red[500]};
      animation: none;
    }
  }
`

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

      <Stack direction="row" display={"flex"} sx={{ alignItems: "center" }}>
        <IconButton size="large" edge="start" color="inherit" href="/">
          <TrafficIcon />
        </IconButton>

        <HoverContainer>
          <Typography
            variant="h6"
            noWrap
            component={Link}
            href="/"
            color="inherit"
            sx={{ textDecoration: "none" }}
          >
            <FadeGreen>Not</FadeGreen>.<FadeYellow>Yet</FadeYellow>.
            <FadeRed>Red</FadeRed>
          </Typography>
        </HoverContainer>
      </Stack>

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
      <AppBar position="fixed">
        <Toolbar>{toolbarElements}</Toolbar>
      </AppBar>
      <Toolbar />
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
      <Suspense>
        <Content />
      </Suspense>
    </main>
  )
}
