"use client"

import { Box, Stack } from "@mui/material"
import React, { useRef, useState } from "react"
import useWindowSize from "../hooks/useWindowSize"
import LightGroups from "../domain/LightGroups"
import TrafficLight from "../domain/TrafficLight"
import LightHead from "./LightHead"

export default function Screen({
  lightGroups,
  lights,
  currentTimestamp,
  width,
  fixed,
}: {
  lightGroups: LightGroups
  lights: TrafficLight[]
  currentTimestamp: number
  width?: number
  fixed?: number
}) {
  const [windowWidth, windowHeight] = useWindowSize()
  const [page, setPage] = useState(0)
  const swipeRef = useRef<HTMLDivElement>(null)

  const groups = lightGroups.raw()
  const shownGroups = fixed === undefined ? groups.map((_, idx) => idx) : [fixed]

  const slides = shownGroups.map((idx) => {
    const group = groups[idx]
    const heightConstrainedSize = width ? 2 * width : windowHeight
    const widthConstrainedSize = (width ?? windowWidth) / group.length

    return (
      <Box key={idx} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
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
                maxHeight={heightConstrainedSize}
              />
            ))}
        </Stack>
      </Box>
    )
  })

  const goTo = (idx: number) =>
    swipeRef.current?.scrollTo({ left: idx * swipeRef.current.clientWidth, behavior: "smooth" })

  // ponytail: native scroll-snap instead of a carousel library
  return (
    <Box sx={{ position: "relative", height: "100%", width: "100%" }}>
      <div
        ref={swipeRef}
        className="swipe"
        onScroll={(e) =>
          setPage(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))
        }
      >
        {slides}
      </div>
      {slides.length > 1 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ position: "absolute", bottom: 24, left: 0, right: 0, justifyContent: "center" }}
        >
          {slides.map((_, idx) => (
            <Box
              key={idx}
              component="button"
              aria-label={`Show phone ${idx + 1}`}
              onClick={() => goTo(idx)}
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
