"use client"

import { AppBar, Box, FormControlLabel, FormGroup, IconButton, Switch, Toolbar, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import TrafficIcon from '@mui/icons-material/Traffic'
import TuneIcon from '@mui/icons-material/Tune'
import QrCodeIcon from '@mui/icons-material/QrCode'
import CrossingComponent from './crossing'

import { useState } from 'react'
import { UiMode } from './uiMode'

const modeIcons = new Map<number, React.JSX.Element>([
  [UiMode.LIGHTS, <TrafficIcon key="traffic" />],
  [UiMode.BARS, <TuneIcon key="tune" />], 
  [UiMode.QR, <QrCodeIcon key="qr" />]
])

export default function Home() {

  const [wakeLock, setWakeLock] = useState<WakeLockSentinel|null>(null)

  const [expanded, setExpanded] = useState(false)

  const [mode, setMode] = useState(UiMode.LIGHTS)

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
    setMode((mode + 1) % 3)
  }

  const modeIcon = modeIcons.get(mode)

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
