"use client"

import { AppBar, Box, IconButton, Toolbar, Typography, Stack, Checkbox, Button, FormControlLabel, Collapse } from '@mui/material'
import TrafficIcon from '@mui/icons-material/Traffic'
import ShareIcon from '@mui/icons-material/Share'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import IntersectionComponent, { UiMode, SelectionMode } from './components/Intersection'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import GridGoldenratioIcon from '@mui/icons-material/GridGoldenratio'

import { Suspense, useState } from 'react'
import { orange, green, yellow, red, grey } from '@mui/material/colors'

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

const { palette } = createTheme()

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

  const [uiMode, setUiMode] = useState<UiMode>('none')

  const buttonAction = (uiMode: UiMode) => {
    return () => {
      setUiMode(uiMode)
    }
  }

  const toolbarElements = (
    <>
      <Stack direction='row' display={'flex'} sx={{ alignItems: "center" }}>
        <IconButton 
          size="large" 
          edge="start" 
          color='inherit' 
        >
          <GridGoldenratioIcon />
        </IconButton>
        <Typography variant="h6" component="div" noWrap>
          Intersection
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

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          {toolbarElements}
        </Toolbar>
      </AppBar>
      <Toolbar />
      <IntersectionComponent 
        uiMode={uiMode}
        setUiMode={setUiMode}
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
