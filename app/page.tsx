"use client"

import { AppBar, Box, FormControlLabel, FormGroup, IconButton, Switch, Toolbar, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import QrCodeIcon from '@mui/icons-material/QrCode'
import CrossingComponent from './crossing'

import { useState } from 'react'
import useStateParams, { BooleanSerDeser, objectSerDeser } from './url'

const modeIcons = new Map<boolean, React.JSX.Element>([
  [true, <QrCodeIcon key="qr" />], 
  [false, <QrCodeIcon key="qr" color="disabled" />]
])

export default function Home() {

  const [wakeLock, setWakeLock] = useState<WakeLockSentinel|null>(null)

  const [expanded, setExpanded] = useStateParams(false, "expanded", BooleanSerDeser)

  const [mode, setMode] = useStateParams({ qr: false }, "qr", objectSerDeser())
  
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

  const toggleMode = () => {
    setMode({ qr: !mode.qr })
  }

  const modeIcon = modeIcons.get(mode.qr)

  return (
    <main>
      <Box sx={{ flexGrow: 1 }}>
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
              { expanded ? <CloseIcon /> : <MenuIcon /> }
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Traffic Lights
            </Typography>
            <IconButton size="large" sx={{ color: "#ffffff" }} onClick={() => toggleMode()}>{modeIcon}</IconButton>
            <FormGroup>
              <FormControlLabel control={<Switch color="warning" checked={wakeLocked()} onChange={() => toggleWakeLock()}/>} label="Screen on"/>
            </FormGroup>
          </Toolbar>
        </AppBar>
      </Box>
      <CrossingComponent expanded={expanded} mode={mode} time={Date.now()}/>
    </main>
  )
}
