"use client"

import { AppBar, Box, IconButton, Toolbar, Typography, Stack, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import ShareIcon from '@mui/icons-material/Share'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import IntersectionComponent, { UiMode } from '../components/Intersection'
import MenuIcon from '@mui/icons-material/Menu'
import { Suspense, useState } from 'react'
import TrafficIcon from '@mui/icons-material/Traffic'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates'

function Content() {

  const [uiMode, setUiMode] = useState<UiMode>('none')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const buttonAction = (uiMode: UiMode) => {
    return () => {
      setUiMode(uiMode)
    }
  }

  const toolbarElements = (
    <>
      <IconButton 
        size="large" 
        edge="start" 
        color='inherit' 
        onClick={() => setDrawerOpen(true)}
      >
        <MenuIcon />
      </IconButton>

      <Box sx={{ flexGrow: 1 }}></Box>

      <Stack direction='row' display={'flex'} sx={{ alignItems: "center" }}>
        <IconButton 
          size="large" 
          edge="start" 
          color='inherit' 
        >
          <TrafficIcon />
        </IconButton>
        <Typography variant="h6" component="div" noWrap>
          Not Yet Red
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

  const drawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={() => setDrawerOpen(false)}>
      <List>
        {[['About', <InfoOutlinedIcon/>, "/about"], ['Ideas', <TipsAndUpdatesIcon/>, "/ideas"], ['Make your own', <TrafficIcon/>, "/intersection"]].map((item, idx) => (
          <ListItem key={idx} disablePadding>
            <ListItemButton href={item[2]}>
              <ListItemIcon>
                {item[1]}
              </ListItemIcon>
              <ListItemText primary={item[0]} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          {toolbarElements}
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {drawerList}
      </Drawer>
      <IntersectionComponent 
        uiMode={uiMode}
        setUiMode={setUiMode}
      />
    </>
  )
}

export default function Home() {
  return (
    <main>
      <Suspense>
        <Content />
      </Suspense>
    </main>
  )
}
