"use client"

import { Box, Button, Snackbar, SnackbarCloseReason, Stack } from '@mui/material'
import Grid from '@mui/material/Grid2'
import React, { ReactElement, useEffect, useRef, useState } from 'react'
import useWindowSize from '../hooks/useWindowSize'

export default function Fullscreen({ 
  enabled, 
  children, 
  onDisabled 
}: { 
  enabled: boolean, 
  children: ReactElement[], 
  onDisabled: () => void 
}) {

  const fullscreenRef = useRef<HTMLDivElement>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  
  const [hiddenChildren, setHiddenChildren] = useState<number[]>([])
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false)
  const [windowWidth, windowHeight] = useWindowSize()

  const heightConstrainedSize = windowHeight
  const widthConstrainedSize = windowWidth / (children.length - hiddenChildren.length)

  // once
  useEffect(() => {
    document.addEventListener("fullscreenchange", (event) => {
      if (!document.fullscreenElement) {
        releaseWakeLock()
        onDisabled()
      } else {
        requestWakeLock()
      }
    })
  }, [])

  useEffect(() => {
    setHiddenChildren([])
    if (enabled) {
      fullscreenRef.current?.requestFullscreen({ navigationUI: 'hide' })
    }
  }, [enabled])

  const requestWakeLock = async () => {
    try {
      if (navigator && navigator.wakeLock) {
        wakeLockRef.current = await navigator.wakeLock.request()
      }
    } catch (err: any) {
      console.error(`${err.name}, ${err.message}`)
    }
  }

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      try {
        wakeLockRef.current.release().then(() => {
          wakeLockRef.current = null
        })
      } catch (err: any) {
        console.error(`${err.name}, ${err.message}`)
      }
    }
  }

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason != 'clickaway') {
      setShowSnackbar(false)
    } 
  }

  const onHideChild = (index: number) => {
    if (hiddenChildren.length < children.length - 1) {
      setHiddenChildren([...hiddenChildren, index])
      setShowSnackbar(true)
    }
  }

  const childrenToRender = children
      .map((ch, index) => React.cloneElement(ch, { 
        maxWidth: widthConstrainedSize, 
        maxHeight: heightConstrainedSize, 
        onClick: () => onHideChild(index) 
      }))
      .filter((ch, index) => !hiddenChildren.includes(index))

  const snackbarAction = (
    <Button color="secondary" size="small" onClick={() => {
      setHiddenChildren(hiddenChildren.filter((x, index) => index != hiddenChildren.length - 1))
      setShowSnackbar(hiddenChildren.length > 1)
    }}>
      UNDO
    </Button>
  )

  return (
    <Box ref={fullscreenRef} className='fullscreen' display={enabled ? 'block' : 'none'}>
      <Grid container justifyContent="center" alignItems="center" sx={{ height: '100%', width: '100%' }}>
        <Stack direction='row' alignItems='flex-end' spacing={0}>
          {childrenToRender}
        </Stack>
      </Grid>
      <Snackbar
        open={showSnackbar}
        onClose={handleClose}
        autoHideDuration={6000}
        message="Traffic light hidden"
        action={snackbarAction}
      />
    </Box>
  )
}
