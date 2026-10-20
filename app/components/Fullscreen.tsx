"use client"

import { Box, IconButton } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import React, { useEffect, useRef } from "react"
import LightGroups from "../domain/LightGroups"
import Screen from "./Screen"
import TrafficLight from "../domain/TrafficLight"

export default function Fullscreen({
  enabled,
  onDisabled,
  lightGroups,
  lights,
  currentTimestamp,
  timeCorrection,
}: {
  enabled: boolean
  onDisabled: () => void
  lightGroups: LightGroups
  lights: TrafficLight[]
  currentTimestamp: number
  timeCorrection: number
}) {
  const fullscreenRef = useRef<HTMLDivElement>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const requestWakeLock = async () => {
    try {
      if (navigator && navigator.wakeLock) {
        wakeLockRef.current = await navigator.wakeLock.request()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      try {
        wakeLockRef.current.release().then(() => {
          wakeLockRef.current = null
        })
      } catch (err) {
        console.error(err)
      }
    }
  }

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

  return (
    <Box
      ref={fullscreenRef}
      className="fullscreen"
      sx={{ display: enabled ? "block" : "none", bgcolor: "background.default" }}
    >
      <Screen
        lightGroups={lightGroups}
        lights={lights}
        currentTimestamp={currentTimestamp}
        timeCorrection={timeCorrection}
        active={enabled}
      />
      <IconButton
        aria-label="Exit fullscreen"
        onClick={() => document.exitFullscreen()}
        sx={{ position: "absolute", top: 16, right: 16, opacity: 0.4, "&:hover": { opacity: 1 } }}
      >
        <CloseIcon />
      </IconButton>
    </Box>
  )
}
