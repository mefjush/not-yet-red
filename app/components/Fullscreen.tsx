"use client"

import { Box } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { Children, ReactElement, useEffect, useRef, useState } from 'react'

export default function Fullscreen({ enabled, children, onDisabled }: { enabled: boolean, children: ReactElement | ReactElement[], onDisabled: () => void }) {

  const fullscreenRef = useRef<HTMLDivElement>(null)

  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null)

  const requestWakeLock = async () => {
    try {
      if (navigator && navigator.wakeLock) {
        const wakeLock = await navigator.wakeLock.request()
        setWakeLock(wakeLock)
      }
    } catch (err: any) {
      alert(`${err.name}, ${err.message}`)
      console.error(`${err.name}, ${err.message}`)
    }
  }

  const releaseWakeLock = async () => {
    // TODO this does not seem to work!

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

  const enterFullScreen = () => {
    requestWakeLock()
    fullscreenRef.current?.requestFullscreen().finally(() => {
      fullscreenRef.current?.addEventListener("fullscreenchange", (event) => {
        if (document['fullscreenElement'] == null) {
          onDisabled()
          releaseWakeLock()
        }
      })
    })
  }

  useEffect(() => {
    if (enabled) {
      enterFullScreen()
    }
  }, [enabled])

  return (
    <Box ref={fullscreenRef} className='fullscreen' display={enabled ? 'block' : 'none'}>
      <Grid container spacing={2} sx={{ p: 1, height: '100vh', width: '100vw' }}>
        { Children.map(children, (ch) => <Grid display="flex" size='grow' justifyContent="center" alignItems="center">{ch}</Grid> )}
      </Grid>
    </Box>
  )
}
