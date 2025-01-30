"use client"

import { AppBar, Box, IconButton, Toolbar, Typography, Stack, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import ShareIcon from '@mui/icons-material/Share'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import IntersectionComponent, { UiMode } from '../components/Intersection'
import MenuIcon from '@mui/icons-material/Menu'
import { Suspense, useState } from 'react'
import TrafficIcon from '@mui/icons-material/Traffic'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates'
import styled, { keyframes, css } from "styled-components"
import { green, yellow, red } from '@mui/material/colors'


const duration = 20

const fadeSpan = (color: string) => {
  var colors = keyframes`
    0% { color: #ffffff; }
    1% { color: ${color}; }
    5% { color: ${color}; }
    6% { color: #ffffff; }
  `;
  
  return styled.span`
    animation: ${duration}s ${colors} infinite linear;
  `
}

const fadeMiddle = (color: string) => {
  var colors = keyframes`
    5% { color: #ffffff; }
    6% { color: ${color}; }
    10% { color: ${color}; }
    11% { color: #ffffff; }
  `;
  
  return styled.span`
    animation: ${duration}s ${colors} infinite linear;
  `
}

const fadeLast = (color: string) => {
  var colors = keyframes`
    0% { color: #ffffff; }
    11% { color: #ffffff; }
    12% { color: ${color}; }
    100% { color: ${color}; }
  `;
  
  return styled.span`
    animation: ${duration}s ${colors} infinite linear;
    color: ${color};
  `
}

const FadeGreen = fadeSpan(green[500])
const FadeYellow = fadeMiddle(yellow[500])
const FadeRed = fadeLast(red[500])

function Content() {

  const [uiMode, setUiMode] = useState<UiMode>('none')
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
        color='inherit' 
        onClick={() => setDrawerOpen(true)}
      >
        <MenuIcon />
      </IconButton>

      <Box sx={{ flexGrow: 1 }}></Box>

      <Stack direction='row' display={'flex'} sx={{ alignItems: "center" }}>
        <IconButton 
          size="large" 
          edge="start" 
          color='inherit' 
        >
          <TrafficIcon />
        </IconButton>
        <Typography variant="h6" component="div" noWrap>
          <FadeGreen>Not</FadeGreen> <FadeYellow>Yet</FadeYellow> <FadeRed>Red</FadeRed>
        </Typography>
      </Stack>
      
      <Box sx={{ flexGrow: 1 }}></Box>

      <IconButton
        size="large"
        color="inherit"
        aria-label="share"
        onClick={buttonAction('share')}
      >
        <ShareIcon />
      </IconButton>

      <IconButton
        size="large"
        color="inherit"
        aria-label="fullscreen"
        edge="end"
        onClick={buttonAction('fullscreen')}
      >
        <FullscreenIcon />
      </IconButton>
    </>
  )

  const subpages = [
    { name: 'About', icon: <InfoOutlinedIcon/>, href: "/about" }, 
    { name: 'Ideas', icon: <TipsAndUpdatesIcon/>, href: "/ideas" }, 
    { name: 'Make your own', icon: <TrafficIcon/>, href: "/intersection" }
  ]

  const drawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={() => setDrawerOpen(false)}>
      <List>
        {subpages.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton href={item.href}>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
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
        <Toolbar>
          {toolbarElements}
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {drawerList}
      </Drawer>
      <IntersectionComponent 
        uiMode={uiMode}
        setUiMode={setUiMode}
      />
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
