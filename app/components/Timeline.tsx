"use client"
/* eslint-disable react-hooks/refs -- slider drag state lives in refs on purpose; refactor before enabling React Compiler */

import LightConfig, { TimeRange } from "../domain/LightConfig"
import { Box, Slider } from "@mui/material"
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp"
import { useLayoutEffect, useRef } from "react"
import Tune from "./Tune"
import React from "react"
import { State, STATE_ATTRIBUTES } from "../domain/State"
import { negativeSafeMod } from "../utils"

// the "now" arrow under the timeline: one linear sweep per cycle, positioned from the synced
// clock as soon as it appears, so it is right from the first frame (no catching up)
function NowMarker({
  cycleLength,
  timeCorrection,
  currentTimestamp,
}: {
  cycleLength: number
  timeCorrection: number
  // re-aligns on every light change, in case the device clock was adjusted
  currentTimestamp: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  // layout effect: placed before the browser paints, so it never shows at 0 first
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || typeof el.animate != "function") return
    const sweep = el.animate([{ transform: "translateX(-100%)" }, { transform: "translateX(0)" }], {
      duration: cycleLength,
      iterations: Infinity,
      easing: "linear",
    })
    sweep.currentTime = negativeSafeMod(Date.now() - timeCorrection, cycleLength)
    el.style.visibility = "visible"
    return () => sweep.cancel()
  }, [cycleLength, timeCorrection, currentTimestamp])

  return (
    <Box
      aria-hidden
      sx={{ position: "absolute", left: 0, right: 0, top: 22, pointerEvents: "none" }}
    >
      {/* the arrow sits at the right edge of a full-width strip that slides in from the left */}
      <Box
        ref={ref}
        // hidden until placed, e.g. in server-rendered HTML
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          transform: "translateX(-100%)",
          visibility: "hidden",
        }}
      >
        <ArrowDropUpIcon sx={{ mr: "-12px" }} />
      </Box>
    </Box>
  )
}

export default function Timeline({
  currentTimestamp,
  timeCorrection,
  lightConfig,
  selectedState,
  editable,
  onLightConfigChange,
}: {
  currentTimestamp: number
  // how far this device's clock is off the synced time
  timeCorrection: number
  lightConfig: LightConfig
  selectedState?: State
  editable: boolean
  onLightConfigChange: (lightConfig: LightConfig) => void
}) {
  const uiOffset = useRef(0)

  const cycleLength = lightConfig.cycleLength()

  const theSelectedState = lightConfig.phases
    .map((phase) => phase.state)
    .find((state) => state == selectedState)

  const timeRange = theSelectedState
    ? lightConfig.getTimeRange(theSelectedState)
    : new TimeRange(0, 0, 0)

  const toUiFirendlyTimeRange = (timeRange: TimeRange): TimeRange =>
    new TimeRange(timeRange.start, timeRange.end == 0 ? cycleLength : timeRange.end, cycleLength)

  const uiRange = useRef(toUiFirendlyTimeRange(timeRange))

  const modCycle = (val: number) => negativeSafeMod(val, cycleLength)

  const timeRangeChanged = !(
    timeRange.start == modCycle(uiRange.current.start) &&
    timeRange.end == modCycle(uiRange.current.end)
  )

  if (timeRangeChanged) {
    uiRange.current = toUiFirendlyTimeRange(timeRange)
  }

  const offsetSliderValue: number = modCycle(timeRange.start + timeRange.duration() / 2)
  const offsetChanged = offsetSliderValue != modCycle(uiOffset.current)
  if (offsetChanged) {
    uiOffset.current = offsetSliderValue
  }

  const onPhaseSliderChange = (state: State, newRange: number[], activeThumb: number) => {
    const newValRaw = newRange[activeThumb]

    uiRange.current =
      (activeThumb == 0) != uiRange.current.inverted()
        ? new TimeRange(newValRaw, uiRange.current.end, cycleLength)
        : new TimeRange(uiRange.current.start, newValRaw, cycleLength)

    const newTimeRange = new TimeRange(
      modCycle(uiRange.current.start),
      modCycle(uiRange.current.end),
      cycleLength,
    )

    onLightConfigChange(lightConfig.withStateTimeRange(state, newTimeRange))
  }

  // both sliders draw the same config, so neither may animate or one lags behind the other
  const slideWithThumbOnly = {
    pointerEvents: "none !important",
    "& .MuiSlider-thumb": {
      pointerEvents: "all !important",
      transition: "none",
    },
    "& .MuiSlider-track": {
      pointerEvents: "none !important",
      transition: "none",
    },
  }

  const thumbStyle = editable ? {} : { display: "none" }

  const offsetSlider = (
    <Slider
      disabled={!editable}
      value={lightConfig.offset}
      step={1000}
      min={0}
      max={cycleLength}
      onChange={(e, newValue) => onLightConfigChange(lightConfig.withOffset(newValue as number))}
      aria-label="Offset"
      slots={{
        track: Tune,
      }}
      slotProps={{
        track: {
          lightConfig: lightConfig,
          onLightConfigChange: onLightConfigChange,
        } as object,
        rail: { style: { display: "none" } },
        thumb: { style: thumbStyle },
      }}
      sx={slideWithThumbOnly}
    />
  )

  const trackStyle = uiRange.current.inverted()
    ? { backgroundColor: "white", height: "2px" }
    : { height: "1px" }

  const getRangeSlider = (selectedState: State) => (
    <Slider
      key="visible-range-slider"
      disableSwap
      value={[uiRange.current.start, uiRange.current.end]}
      step={1000}
      min={0}
      max={cycleLength}
      onChange={(e, newValue, activeThumb) =>
        onPhaseSliderChange(selectedState, newValue as number[], activeThumb)
      }
      aria-label="Range"
      track={uiRange.current.inverted() ? "inverted" : "normal"}
      slotProps={{
        track: { style: { ...trackStyle, border: "none" } },
        rail: {
          style: {
            display: uiRange.current.inverted() ? "inline" : "none",
            height: "1px",
          },
        },
        thumb: {
          style: { borderRadius: "0px", width: "1px", marginTop: "10px" },
        },
        mark: { style: { display: "none" } },
        markLabel: { style: { marginTop: "-36px" } },
      }}
      sx={{
        ...slideWithThumbOnly,
        marginBottom: 0,
        color: `${STATE_ATTRIBUTES[selectedState].color}.main`,
      }}
      marks={[
        {
          value: modCycle(timeRange.start + timeRange.duration() / 2),
          label: `${timeRange.duration() / 1000} s`,
        },
      ]}
    />
  )

  const invisibleSlider = <Slider key="hidden-range-slider" style={{ visibility: "hidden" }} />

  const rangeSlider =
    editable && theSelectedState ? getRangeSlider(theSelectedState) : invisibleSlider

  return (
    <Box sx={{ my: 2 }}>
      {rangeSlider}
      {/* room below the bar for the "now" arrow */}
      <Box sx={{ position: "relative", pb: 2.5 }}>
        {offsetSlider}
        <NowMarker
          cycleLength={cycleLength}
          timeCorrection={timeCorrection}
          currentTimestamp={currentTimestamp}
        />
      </Box>
    </Box>
  )
}
