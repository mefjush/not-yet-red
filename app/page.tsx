"use client"

import { AppBar, Box, IconButton, Toolbar, Typography, Stack } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import CrossingComponent from './components/crossing'
import { createTheme, ThemeProvider, styled, PaletteColorOptions } from '@mui/material/styles';

import { Suspense } from 'react'
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

  interface BoxPropsColorOverrides {
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
      <ThemeProvider theme={theme}>
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
      </ThemeProvider>
    </main>
  )
}
