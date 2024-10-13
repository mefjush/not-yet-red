"use client"

import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import CrossingComponent from './components/crossing'

import useStateParams, { BooleanSerDeser, objectSerDeser } from './url'
import { Suspense } from 'react'

function Content() {
  
  const [expanded, setExpanded] = useStateParams(true, "expanded", BooleanSerDeser)
 
  return (
    <>
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
          </Toolbar>
        </AppBar>
      </Box>
      <CrossingComponent expanded={expanded} time={Date.now()}/>
    </>
  )
}

export default function Home() {

  // const [expanded, setExpanded] = useStateParams(true, "expanded", BooleanSerDeser)

  return (
    <main>
      <Suspense>
        <Content />
      </Suspense>
    </main>
  )
}
