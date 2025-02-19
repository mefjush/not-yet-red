"use client"

import { Box } from "@mui/material"
import React, { useEffect, useRef } from "react"
import "swiper/css"
import "swiper/css/pagination"
import LightGroups from "../domain/LightGroups"
import Screen from "./Screen"
import TrafficLight from "../domain/TrafficLight"

export default function Fullscreen({
  enabled,
  onDisabled,
  lightGroups,
  lights,
  currentTimestamp,
}: {
  enabled: boolean
  onDisabled: () => void
  lightGroups: LightGroups
  lights: TrafficLight[]
  currentTimestamp: number
}) {
  const fullscreenRef = useRef<HTMLDivElement>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

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
      fullscreenRef.current?.requestFullscreen({ navigationUI: "hide" })
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
    <Box ref={fullscreenRef} className="fullscreen" display={enabled ? "block" : "none"}>
      <Screen lightGroups={lightGroups} lights={lights} currentTimestamp={currentTimestamp} />
    </Box>
  )
}
