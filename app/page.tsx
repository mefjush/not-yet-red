"use client"

import { AppBar, Box, IconButton, Toolbar, Typography, Stack } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import CrossingComponent from './components/crossing'

import { Suspense } from 'react'

function Content() {

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            {/* <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton> */}
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Traffic Lights
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>
      <CrossingComponent time={Date.now()}/>
    </>
  )
}

export default function Home() {
  return (
    <main>
      <Suspense>
        <Content />
      </Suspense>
      <Stack spacing={2} sx={{ p: 1, m: 1 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <img src="/favicon.ico" /> <p>2024 <strong>Traffic Lights</strong> by mefju</p>
        </Box>
      </Stack>
    </main>
  )
}
