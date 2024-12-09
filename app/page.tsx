"use client"

import { AppBar, Box, IconButton, Toolbar, Typography, Stack, Checkbox, Button, FormControlLabel, Collapse } from '@mui/material'
import TrafficIcon from '@mui/icons-material/Traffic'
import ShareIcon from '@mui/icons-material/Share'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import IntersectionComponent, { BatchMode, RefObject } from './components/Intersection'
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

  const [totalCount, setTotalCount] = useState(1)

  const [selectionMode, setSelectionMode] = useState(false)
  const [allSelected, setAllSelected] = useState<boolean | undefined>(false)
  const [uiMode, setUiMode] = useState<BatchMode>('none')
  
  const checkbox = (
    <Checkbox 
      edge="start"
      size='medium'
      checked={allSelected == true}
      indeterminate={allSelected == undefined} 
      aria-label='select all'
      onChange={e => {
        setAllSelected(e.target.checked)
      }}
      color='default'
      sx={{
        color: 'white'
      }}
    />
  )

  const buttonAction = (uiMode: BatchMode) => {
    return () => {
      if (selectionMode) {
        setSelectionMode(false)
      } else {
        if (totalCount > 1) {
          setSelectionMode(true)
          setUiMode(uiMode)
        } else {
          setAllSelected(true)
          setUiMode(uiMode)
        }
      }
    }
  }

  const toolbarElements = (
    <>
      <Collapse orientation='horizontal' in={!selectionMode}>
        <Stack direction='row' display={'flex'} sx={{ alignItems: "center" }}>
          <IconButton 
            size="large" 
            edge="start" 
            color='inherit' 
            href="/"
          >
            <GridGoldenratioIcon />
          </IconButton>
          <Typography variant="h6" component="div" noWrap>
            Intersection
          </Typography>
        </Stack>
      </Collapse>
      
      { selectionMode || <Box sx={{ flexGrow: 1 }}></Box> }

      { (!selectionMode || uiMode == 'share') && 
        <IconButton
          size="large"
          color="inherit"
          aria-label="share"
          edge={selectionMode && 'start'}
          onClick={buttonAction('share')}
        >
          <ShareIcon />
        </IconButton>
      }

      { (!selectionMode || uiMode == 'fullscreen') && 
        <IconButton
          size="large"
          color="inherit"
          aria-label="fullscreen"
          edge={selectionMode ? 'start' : 'end'}
          onClick={buttonAction('fullscreen')}
        >
          <FullscreenIcon />
        </IconButton>
      }

      { selectionMode && <Box sx={{ flexGrow: 1 }}></Box> }

      <Collapse in={selectionMode} orientation='horizontal' unmountOnExit>
        <Stack direction={'row'}>
          <FormControlLabel
            control={checkbox}
            label="Select all"
            labelPlacement='end'
            style={{ whiteSpace: 'nowrap' }}
            sx={{ marginLeft: 1 }}
          />

          <Button 
            color='inherit' 
            onClick={e => {
              setUiMode('none')
              setSelectionMode(false)
              setAllSelected(false)
            }}
          >
            cancel
          </Button>
          <Button 
            color='inherit' 
            onClick={buttonAction(uiMode)}
          >
            ok
          </Button>
        </Stack>
      </Collapse>
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
        selectionMode={selectionMode}
        allSelected={allSelected}
        onSelectionChanged={(updatedTotalCount, updatedSelectedCount) => {
          setTotalCount(updatedTotalCount)
          if (updatedSelectedCount == 0) {
            setAllSelected(false)
          } else if (updatedTotalCount == updatedSelectedCount) {
            setAllSelected(true)
          } else {
            setAllSelected(undefined)
          }
        }}
        uiMode={selectionMode ? 'none' : uiMode}
        setUiMode={(uiMode) => {
          if (uiMode == 'none') {
            setAllSelected(false)
          }
          setUiMode(uiMode)
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
