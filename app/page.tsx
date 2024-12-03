"use client"

import { AppBar, Box, IconButton, Toolbar, Typography, Stack, Checkbox, Button, FormControlLabel } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import TrafficIcon from '@mui/icons-material/Traffic'
import CircleIcon from '@mui/icons-material/Circle'
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined'
import ShareIcon from '@mui/icons-material/Share'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import CrossingComponent, { BatchMode, RefObject } from './components/crossing'
import { createTheme, ThemeProvider, styled, PaletteColorOptions } from '@mui/material/styles'

import { Suspense, useRef, useState } from 'react'
import { orange, green, yellow, red, grey } from '@mui/material/colors';

//https://mui.com/material-ui/customization/palette/
declare module "@mui/material/styles" {
  interface Palette {
    tlRed: Palette['primary']
    tlYellow: Palette['primary']
    tlOrange: Palette['primary']
    tlGreen: Palette['primary']
    tlGrey: Palette['primary']
  }
  interface PaletteOptions {
    tlRed: Palette['primary']
    tlYellow: Palette['primary']
    tlOrange: Palette['primary']
    tlGreen: Palette['primary']
    tlGrey: Palette['primary']
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    tlRed: true
    tlYellow: true
    tlOrange: true
    tlGreen: true
    tlGrey: true
  }
}

declare module "@mui/material/Box" {
  interface BoxPropsColorOverrides {
    tlRed: true
    tlYellow: true
    tlOrange: true
    tlGreen: true
    tlGrey: true
  }
}

declare module "@mui/material/Slider" {
  interface SliderPropsColorOverrides {
    tlRed: true
    tlYellow: true
    tlOrange: true
    tlGreen: true
    tlGrey: true
  }
}

declare module "@mui/material/Radio" {
  interface RadioPropsColorOverrides {
    tlRed: true
    tlYellow: true
    tlOrange: true
    tlGreen: true
    tlGrey: true
  }
}

const { palette } = createTheme();

const theme = createTheme({
  palette: {
    tlRed: palette.augmentColor({ color: red }),
    tlYellow: palette.augmentColor({ color: yellow }),
    tlOrange: palette.augmentColor({ color: orange }),
    tlGreen: palette.augmentColor({ color: green }),
    tlGrey: palette.augmentColor({ color: grey })
  }
})

function Content() {

  const [totalCount, setTotalCount] = useState(0)
  const [selectedCount, setSelectedCount] = useState(0)

  const [selectionMode, setSelectionMode] = useState(false)
  const [uiMode, setUiMode] = useState<BatchMode>('none')
  
  const childRef = useRef<RefObject>(null)

  const baseToolbarElements = (
    <>
      <IconButton 
        size="large" 
        edge="start" 
        color='inherit' 
        href="/"
      >
        <TrafficIcon />
      </IconButton>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        Traffic Lights
      </Typography>
      
      <IconButton
        size="large"
        color="inherit"
        aria-label="share"
        onClick={(e) => {
          if (totalCount > 1) {
            setSelectionMode(true)
            setUiMode('share')
          } else {
            childRef?.current?.enterShareDialog()
          }
        }}
      >
        <ShareIcon />
      </IconButton>
      <IconButton
        size="large"
        // edge="end"
        color="inherit"
        aria-label="fullscreen"
        onClick={(e) => {
          if (totalCount > 1) {
            setSelectionMode(true)
            setUiMode('fullscreen')
          } else {
            childRef?.current?.enterFullscreen()
          }
        }}
      >
        <FullscreenIcon />
      </IconButton>
    </>
  )

  const checkbox = (
    <Checkbox 
      edge="start"
      size='medium'
      checked={totalCount == selectedCount} 
      indeterminate={selectedCount != totalCount && selectedCount > 0} 
      aria-label='select all'
      onChange={e => {
        childRef?.current?.handleSelectAll(e.target.checked)
      }}
      color='default'
      sx={{
        color: 'white'
      }}
    />
  )

  const action = ((uiMode == 'fullscreen') ? childRef?.current?.enterFullscreen : childRef?.current?.enterShareDialog) || (() => {})
  const icon = (uiMode == 'fullscreen') ? <FullscreenIcon /> : <ShareIcon />

  const selectionToolbarElements = (
    <>
      <IconButton 
        size="large" 
        edge="start" 
        color='inherit' 
        onClick={action}
      >
        {icon}
      </IconButton>

      <Box sx={{ flexGrow: 1 }}></Box>

      <FormControlLabel 
        control={checkbox}
        label="Select all"
        labelPlacement='end'
      />
      
      <Button 
        color='inherit' 
        onClick={e => {
          setUiMode('none')
          setSelectionMode(false)
        }}
      >
        cancel
      </Button>
      <Button 
        color='inherit' 
        onClick={e => {
          setSelectionMode(false)
          action()
        }}
      >
        ok
      </Button>
    </>
  )

  const toolbarElements = selectionMode ? selectionToolbarElements : baseToolbarElements

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="fixed">
          <Toolbar>
            {/* <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              
            >
              <MenuIcon />
            </IconButton> */}
            {/* <IconButton 
              size="large" 
              edge="start" 
              color='inherit' 
              href="/"
            >
              <TrafficIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Traffic Lights
            </Typography> */}
            {/* <IconButton
              size="large"
              color="inherit"
              aria-label="share"
              onClick={(e) => {
                if (totalCount > 1) {
                  setBatchMode('share')
                } else {
                  
                }
              }}
            >
              <ShareIcon />
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="fullscreen"
              onClick={(e) => setBatchMode('fullscreen')}
            >
              <FullscreenIcon />
            </IconButton> */}

            {toolbarElements}
          </Toolbar>
        </AppBar>
        <Toolbar />
      </Box>
      <CrossingComponent 
        ref={childRef}
        selectionMode={selectionMode}
        onSelectionChanged={(updatedTotalCount, updatedSelectedCount) => {
          setSelectedCount(updatedSelectedCount)
          setTotalCount(updatedTotalCount)
        }}
      />
      <Stack spacing={2} sx={{ p: 1, m: 1 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <IconButton size="large" edge="start" href="/">
            <TrafficIcon />
          </IconButton> 
          <p>2024 <strong>Traffic Lights</strong> by mefju</p>
        </Box>
      </Stack>
    </>
  )
}

export default function Home() {
  return (
    <main>
      <ThemeProvider theme={theme}>
        <Suspense>
          <Content />
        </Suspense>
      </ThemeProvider>
    </main>
  )
}
