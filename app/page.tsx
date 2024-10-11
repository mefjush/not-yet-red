"use client"

import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import QrCodeIcon from '@mui/icons-material/QrCode'
import CrossingComponent from './components/crossing'

import useStateParams, { BooleanSerDeser, objectSerDeser } from './url'

const modeIcons = new Map<boolean, React.JSX.Element>([
  [true, <QrCodeIcon key="qr" />], 
  [false, <QrCodeIcon key="qr" color="disabled" />]
])

export default function Home() {

  const [expanded, setExpanded] = useStateParams(true, "expanded", BooleanSerDeser)

  const [mode, setMode] = useStateParams({ qr: false }, "qr", objectSerDeser())

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
          </Toolbar>
        </AppBar>
      </Box>
      <CrossingComponent expanded={expanded} mode={mode} time={Date.now()}/>
    </main>
  )
}
