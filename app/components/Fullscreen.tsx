"use client"

import { Box, Stack } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { ReactElement, useEffect, useRef } from 'react'

export default function Fullscreen({ enabled, children, onDisabled }: { enabled: boolean, children: ReactElement | ReactElement[], onDisabled: () => void }) {

  const fullscreenRef = useRef<HTMLDivElement>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

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

  return (
    <Box ref={fullscreenRef} className='fullscreen' display={enabled ? 'block' : 'none'}>
      <Grid container justifyContent="center" alignItems="center" sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: '100%', width: '100%' }}>
        <Stack direction='row' alignItems='flex-end' spacing={0}>
          {children}
        </Stack>
      </Grid>
    </Box>
  )
}
