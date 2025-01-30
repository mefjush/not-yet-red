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
import styled, { keyframes } from "styled-components"
import { green, yellow, red } from '@mui/material/colors'

const colorFadeSpan = (color: string, start: number, end: number) => {
  const colors = keyframes`
    ${start}% { color: #ffffff; }
    ${start + 1}% { color: ${color}; }
    ${end}% { color: ${color}; }
    ${end + 1}% { color: #ffffff; }
  `;
  
  return styled.span`animation: 25s ${colors} infinite linear;`
}

const FadeGreen = colorFadeSpan(green[500], 0, 5)
const FadeYellow = colorFadeSpan(yellow[500], 5, 10)
const FadeRed = colorFadeSpan(red[500], 10, 99)

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
          href="/"
        >
          <TrafficIcon />
        </IconButton>
        <Typography variant="h6" component="div" noWrap>
          <FadeGreen>Not</FadeGreen>.<FadeYellow>Yet</FadeYellow>.<FadeRed>Red</FadeRed>
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
    { name: 'Create new', icon: <TrafficIcon/>, href: "/intersection" }
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
