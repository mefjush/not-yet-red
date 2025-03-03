"use client"

import { Stack } from "@mui/material"
import Grid from "@mui/material/Grid2"
import React from "react"
import useWindowSize from "../hooks/useWindowSize"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
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

  const slides = lightGroups.raw().map((group, idx) => {
    const heightConstrainedSize = width ? 2 * width : windowHeight
    const widthConstrainedSize = (width ?? windowWidth) / group.length

    const groupChildren = group
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
      ))

    return (
      <SwiperSlide key={idx}>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{ height: "100%", width: "100%" }}
        >
          <Stack direction="row" alignItems="flex-end" spacing={0}>
            {groupChildren}
          </Stack>
        </Grid>
      </SwiperSlide>
    )
  })

  return (
    <Swiper
      initialSlide={fixed ?? 0}
      style={{ height: "100%", width: "100%" }}
      modules={[Pagination]}
      pagination={{ clickable: true }}
      enabled={fixed === undefined}
    >
      {slides}
    </Swiper>
  )
}
