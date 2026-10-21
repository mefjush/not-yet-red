"use client"

import { Box, IconButton, Stack, Tooltip } from "@mui/material"
import VolumeUpIcon from "@mui/icons-material/VolumeUp"
import VolumeOffIcon from "@mui/icons-material/VolumeOff"
import React, { useEffect, useRef, useState } from "react"
import useWindowSize from "../hooks/useWindowSize"
import LightGroups from "../domain/LightGroups"
import TrafficLight from "../domain/TrafficLight"
import LightHead from "./LightHead"
import { negativeSafeMod } from "../utils"
import useCrossingSound, { hasCrossingSound, unlockAudio } from "../hooks/useCrossingSound"

// per phone, so you can choose which phone beeps
const SOUND_KEY = "pedestrianSound"
const readSoundSetting = () => {
  try {
    return localStorage.getItem(SOUND_KEY) == "on"
  } catch {
    return false
  }
}

export default function Screen({
  lightGroups,
  lights,
  currentTimestamp,
  timeCorrection,
  active,
}: {
  lightGroups: LightGroups
  lights: TrafficLight[]
  currentTimestamp: number
  // how far this device's clock is off the synced time
  timeCorrection: number
  // shown fullscreen right now
  active: boolean
}) {
  const [windowWidth, windowHeight] = useWindowSize()
  const [page, setPage] = useState(0)
  const pageRef = useRef(0)
  const swipeRef = useRef<HTMLDivElement>(null)
  const settleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [soundOn, setSoundOn] = useState(() => typeof window != "undefined" && readSoundSetting())

  const groups = lightGroups.raw()
  const count = groups.length
  const loop = count > 1
  // ponytail: endless swiping via a copy of the last group in front and of the first at the end;
  // once a swipe settles on a copy, jump to the real one
  const order = loop ? [count - 1, ...groups.map((_, idx) => idx), 0] : groups.map((_, idx) => idx)
  const offset = loop ? 1 : 0

  const scrollToPage = (idx: number, behavior: ScrollBehavior = "instant") =>
    swipeRef.current?.scrollTo({ left: (idx + offset) * swipeRef.current.clientWidth, behavior })

  // keep the current page in view when the size changes: entering fullscreen, rotating the phone
  useEffect(() => {
    const el = swipeRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      el.scrollTo({ left: (pageRef.current + offset) * el.clientWidth, behavior: "instant" })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [offset])

  const onScroll = (el: HTMLDivElement) => {
    if (el.clientWidth == 0) return
    const position = Math.round(el.scrollLeft / el.clientWidth)
    pageRef.current = negativeSafeMod(position - offset, count)
    setPage(pageRef.current)

    if (settleTimeout.current) clearTimeout(settleTimeout.current)
    settleTimeout.current = setTimeout(() => {
      if (loop && (position == 0 || position == count + 1)) {
        scrollToPage(pageRef.current)
      }
    }, 150)
  }

  useEffect(
    () => () => {
      if (settleTimeout.current) clearTimeout(settleTimeout.current)
    },
    [],
  )

  // the pedestrian or railway light on the phone being shown, if any
  const shownGroup = groups[page] ?? []
  const soundInGroupIdx = shownGroup.findIndex((lightConfig) =>
    hasCrossingSound(lightConfig.preset),
  )
  const soundLight =
    soundInGroupIdx >= 0 ? lights[lightGroups.idLookup(page, soundInGroupIdx)] : undefined

  useCrossingSound(active && soundOn ? soundLight : undefined, timeCorrection)

  const toggleSound = () => {
    const on = !soundOn
    if (on) unlockAudio()
    setSoundOn(on)
    try {
      localStorage.setItem(SOUND_KEY, on ? "on" : "off")
    } catch {}
  }

  const slides = order.map((idx, position) => {
    const group = groups[idx]
    const widthConstrainedSize = windowWidth / group.length

    return (
      <Box key={position} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Stack direction="row" sx={{ alignItems: "flex-end" }}>
          {group
            .map((_, inGroupIdx) => lightGroups.idLookup(idx, inGroupIdx))
            .map((lightIdx) => (
              <LightHead
                key={`fullscreen-light-${lightIdx}`}
                currentTimestamp={currentTimestamp}
                light={lights[lightIdx]}
                lightConfig={lights[lightIdx].lightConfig}
                maxWidth={widthConstrainedSize}
                maxHeight={windowHeight}
              />
            ))}
        </Stack>
      </Box>
    )
  })

  return (
    <Box
      sx={{ position: "relative", height: "100%", width: "100%" }}
      // a sound setting saved earlier still needs a tap before the browser plays anything
      onPointerDown={soundOn ? unlockAudio : undefined}
    >
      <div ref={swipeRef} className="swipe" onScroll={(e) => onScroll(e.currentTarget)}>
        {slides}
      </div>
      {/* re-mounted whenever the shown phone changes, which restarts its fade */}
      {active && loop && (
        <Box
          key={page}
          className="phone-label"
          role="status"
          sx={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            px: 2,
            py: 0.75,
            borderRadius: 99,
            bgcolor: "rgba(0, 0, 0, 0.65)",
            color: "#fff",
            typography: "subtitle1",
            fontWeight: 700,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          Phone {page + 1} of {count}
        </Box>
      )}
      {active && soundLight && (
        <Tooltip title={soundOn ? "Mute crossing sounds" : "Play crossing sounds"}>
          <IconButton
            aria-label={soundOn ? "Mute crossing sounds" : "Play crossing sounds"}
            aria-pressed={soundOn}
            onClick={toggleSound}
            sx={{ position: "absolute", top: 16, left: 16, opacity: soundOn ? 0.9 : 0.4 }}
          >
            {soundOn ? <VolumeUpIcon /> : <VolumeOffIcon />}
          </IconButton>
        </Tooltip>
      )}
      {loop && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ position: "absolute", bottom: 24, left: 0, right: 0, justifyContent: "center" }}
        >
          {groups.map((_, idx) => (
            <Box
              key={idx}
              component="button"
              aria-label={`Show phone ${idx + 1}`}
              onClick={() => scrollToPage(idx, "smooth")}
              sx={{
                width: 10,
                height: 10,
                p: 0,
                border: 0,
                borderRadius: "50%",
                cursor: "pointer",
                bgcolor: "text.primary",
                opacity: idx == page ? 0.9 : 0.25,
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  )
}
