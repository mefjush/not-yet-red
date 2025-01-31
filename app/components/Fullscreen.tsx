"use client"

import { Box, Stack } from '@mui/material'
import Grid from '@mui/material/Grid2'
import React, { ReactElement, useEffect, useRef } from 'react'
import useWindowSize from '../hooks/useWindowSize'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

export default function Fullscreen({ 
  enabled, 
  children,
  onDisabled,
  grouping 
}: { 
  enabled: boolean, 
  children: ReactElement[], 
  onDisabled: () => void 
  grouping: number[][]
}) {

  const fullscreenRef = useRef<HTMLDivElement>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  
  const [windowWidth, windowHeight] = useWindowSize()

  const fullscreenchange = () => {
    if (!document.fullscreenElement) {
      releaseWakeLock()
      onDisabled()
    } else {
      requestWakeLock()
    }
  }

  // once
  useEffect(() => {
    document.addEventListener("fullscreenchange", fullscreenchange)
    return () => {
      document.removeEventListener("fullscreenchange", fullscreenchange)
    }
  })

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

  const groupToRender = (children: ReactElement[]) => {
    const heightConstrainedSize = windowHeight
    const widthConstrainedSize = windowWidth / children.length

    return children.map((child) => React.cloneElement(child, { 
      maxWidth: widthConstrainedSize, 
      maxHeight: heightConstrainedSize
    }))
  }

  const slides = grouping.map((group, idx) => {
    const groupChildren = groupToRender(group.map(lightIdx => children[lightIdx]))
    return (
      <SwiperSlide key={idx}>
        <Grid container justifyContent="center" alignItems="center" sx={{ height: '100%', width: '100%' }}>
          <Stack direction='row' alignItems='flex-end' spacing={0}>
            {groupChildren}
          </Stack>
        </Grid>
      </SwiperSlide>
    )
  })

  return (
    <Box ref={fullscreenRef} className='fullscreen' display={enabled ? 'block' : 'none'}>
      <Swiper
        style={{ height: '100%', width: '100%' }}
        modules={[Pagination]}
        pagination={{ clickable: true }}
        onSlideChange={() => console.log('slide change')}
        onSwiper={(swiper) => console.log(swiper)}
      >
        {slides}
      </Swiper>
    </Box>
  )
}
