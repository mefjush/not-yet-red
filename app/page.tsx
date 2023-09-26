"use client"

import { AppBar, Box, Collapse, Drawer, FormControlLabel, FormGroup, IconButton, List, ListItem, Switch, Toolbar, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CrossingComponent from './crossing'

import { useState } from 'react'

export default function Home() {

  const [wakeLock, setWakeLock] = useState<WakeLockSentinel|null>(null)

  const [expanded, setExpanded] = useState(false)

  const wakeLocked = () => wakeLock != null

  const requestWakeLock = async () => {
    try {
      const wakeLock = await navigator.wakeLock.request()
      setWakeLock(wakeLock)
    } catch (err: any) {
      alert(`${err.name}, ${err.message}`)
      console.error(`${err.name}, ${err.message}`)
    }
  };

  const releaseWakeLock = async () => {
    if (!wakeLock) {
      return
    }
    try {
      wakeLock.release()
      setWakeLock(null)
    } catch (err: any) {
      console.error(`${err.name}, ${err.message}`)
    }
  }

  const toggleWakeLock = async () => {
    if (wakeLocked()) {
      releaseWakeLock()
    } else {
      requestWakeLock()
    }
  }


  const toggleDrawer =
    (open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return
      }

      setExpanded(open)
  }

  return (
    <main>
      <Box sx={{ flexGrow: 1 }}>
      <Drawer
        anchor="left"
        open={expanded}
        onClose={toggleDrawer(false)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
              <ListItem key={text} disablePadding>
                {text}
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={ () => setExpanded(!expanded) }
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Traffic Lights
            </Typography>
            <FormGroup>
              <FormControlLabel control={<Switch color="warning" checked={wakeLocked()} onChange={() => toggleWakeLock()}/>} label="Screen on"/>
            </FormGroup>
          </Toolbar>
        </AppBar>
      </Box>


      <CrossingComponent expanded={expanded} time={Date.now()}/>
    </main>
  )
}
