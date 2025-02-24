"use client"

import { useState, useEffect, ReactElement } from "react"
import Clock from "../domain/Clock"
import TrafficLight from "../domain/TrafficLight"
import LightConfig, { DEFAULT_LIGHT_CONFIG } from "../domain/LightConfig"
import Failure from "../domain/Failure"
import { Box, Fab, Stack, useTheme } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import { lightConfigParser, IntersectionConfigParser } from "../url"
import IntersectionConfig, { DEFAULT_INTERSECTION_CONFIG } from "../domain/IntersectionConfig"
import Fullscreen from "./Fullscreen"
import React from "react"
import ShareDialog from "./ShareDialog"
import timeSync from "../domain/timeSync"
import LightDetails from "./LightDetails"
import { createParser, Options, parseAsArrayOf, parseAsInteger, useQueryState } from "nuqs"
import IntersectionConfigPanel from "./IntersectionConfigPanel"
import LightCard from "./LightCard"
import { State } from "../domain/State"
import LightGroups from "../domain/LightGroups"
import GroupButton from "./GroupButton"

export type UiMode = "none" | "share" | "fullscreen"

const historyPush: Options = { history: "push" }

// TODOs
// better examples page
// aria stuff
// settings small arrow
// phone app logo in red?
// back button a bit confusing in expand mode
// light pattern img
// Offline usage
// Manual time correction in cookie / local storage
// blink & beep
// fix the timeline range slider on edge (when expanding)
// breadcrumbs
// android app

export default function IntersectionComponent({
  uiMode,
  setUiMode,
}: {
  uiMode: UiMode
  setUiMode: (uiMode: UiMode) => void
}) {
  const [intersectionConfig, setIntersectionConfig] = useQueryState(
    "intersection",
    createParser(IntersectionConfigParser).withDefault(DEFAULT_INTERSECTION_CONFIG),
  )

  const THE_DEFAULT = [DEFAULT_LIGHT_CONFIG.withIntersectionConfig(intersectionConfig)]

  const lightGroupsParser = parseAsArrayOf(
    createParser(lightConfigParser(intersectionConfig)).withDefault(THE_DEFAULT),
  ).withDefault([THE_DEFAULT])

  const [lightGroups, setLightGroups] = useQueryState("lights", lightGroupsParser)

  const [expanded, setExpanded] = useQueryState("e", parseAsInteger.withOptions(historyPush))

  const [timeCorrection, setTimeCorrection] = useState(0)

  const [currentTimestamp, setCurrentTimestamp] = useState(Date.now())

  const fixedLightGroups = lightGroups.map((lg) =>
    lg.map((lc) => lc.withIntersectionConfig(intersectionConfig)),
  )

  const theLightGroups = new LightGroups(fixedLightGroups)

  const lightConfigs = fixedLightGroups.flatMap((x) => x)

  const [selectedStates, setSelectedStates] = useState(
    lightConfigs.map((lightConfig) => lightConfig.phases[0].state),
  )

  const theme = useTheme()

  const failure = new Failure(
    intersectionConfig.failure.duration,
    intersectionConfig.failure.probability,
  )

  const hasFailed = failure.currentState(currentTimestamp)

  const lights = lightConfigs.map((lightConfig) => new TrafficLight(lightConfig, hasFailed))

  const clock = new Clock(timeCorrection)

  const updateLightConfig = (lightConfig: LightConfig, index: number) => {
    setLightGroups(theLightGroups.withLightReplaced(index, lightConfig).raw())
    setCurrentTimestamp(clock.now())
  }

  const updateSelectedState = (state: State, lightIdx: number) => {
    const copy = [...selectedStates]
    copy.splice(lightIdx, 1, state)
    setSelectedStates(copy)
  }

  const wrapListener = {
    nextStateTimestamp: (timestamp: number) =>
      (Math.floor(timestamp / intersectionConfig.cycleLength) + 1) * intersectionConfig.cycleLength,
  }

  const exitUiMode = () => setUiMode("none")

  const initTimeSync = () =>
    timeSync()
      .then((correction) => setTimeCorrection(correction))
      .catch((e) => setTimeCorrection(0))

  const updateIntersectionConfig = (intersectionConfig: IntersectionConfig) => {
    setIntersectionConfig(intersectionConfig)
    setCurrentTimestamp(clock.now())
  }

  const onSplit = (groupIdx: number, splitIdx: number) => {
    setLightGroups(theLightGroups.ungrouped(groupIdx, splitIdx).raw())
  }

  const onGroupDown = (groupIdx: number) => {
    setLightGroups(theLightGroups.groupedDown(groupIdx).raw())
  }

  const onMove = (lightIdx: number, amount: number) => {
    const otherIdx = lightIdx + amount

    if (otherIdx < 0 || otherIdx >= theLightGroups.size()) {
      return
    }

    const movedEl = theLightGroups.lookup(lightIdx)
    const otherEl = theLightGroups.lookup(otherIdx)

    setLightGroups(
      theLightGroups
        .withLightReplaced(lightIdx, otherEl)
        .withLightReplaced(otherIdx, movedEl)
        .raw(),
    )

    setSelectedStates(
      selectedStates
        .filter((_, i) => i != lightIdx)
        .toSpliced(otherIdx, 0, selectedStates[lightIdx]),
    )
  }

  const onAdd = () => {
    setLightGroups(theLightGroups.withLightAdded(DEFAULT_LIGHT_CONFIG).raw())
    setSelectedStates([...selectedStates, DEFAULT_LIGHT_CONFIG.phases[0].state])
    setExpanded(lightConfigs.length)
  }

  const onDeleteOne = (lightIdx: number) => {
    setLightGroups(theLightGroups.withLightDeleted(lightIdx).raw())
    setSelectedStates([...selectedStates].filter((ls, i) => i != lightIdx))
    setUiMode("none")
    setExpanded(null)
  }

  const getShareUrl = () => {
    const search = `?intersection=${IntersectionConfigParser.serialize(intersectionConfig)}&lights=${lightGroupsParser.serialize(theLightGroups.raw())}`

    const baseUrl =
      typeof window === "undefined" ? process.env.NEXT_PUBLIC_SITE_URL : window.location.origin

    return baseUrl + "/intersection" + search
  }

  // once
  useEffect(() => {
    initTimeSync()
  }, [])

  // after each render
  useEffect(() => {
    clock.register([...lights, failure, wrapListener]).then(setCurrentTimestamp)
    return () => {
      clock.unregister()
    }
  })

  const groupBoxStyle = {
    borderLeftStyle: "solid",
    borderWidth: theme.spacing(1),
    ml: -2,
    pl: 1,
    py: 1,
  }

  const joinButton = (groupIdx: number, lightIdx: number): ReactElement => (
    <GroupButton
      grouped={false}
      key={`group-button-${lightIdx}`}
      onClick={() => onGroupDown(groupIdx)}
      sx={{ ...groupBoxStyle, borderColor: "transparent" }}
    />
  )

  const splitButton = (groupIdx: number, splitIdx: number, lightIdx: number): ReactElement => (
    <GroupButton
      grouped={true}
      key={`group-button-${lightIdx}`}
      onClick={() => onSplit(groupIdx, splitIdx)}
      sx={{ ...groupBoxStyle, borderColor: "primary.main" }}
    />
  )

  const intersectionGroups = lightConfigs.map((_, lightIdx) => {
    const { groupIdx, inGroupIdx } = theLightGroups.indexing[lightIdx]

    const card = (
      <Box
        key={`light-${lightIdx}`}
        sx={{
          ...groupBoxStyle,
          borderColor: lightGroups[groupIdx].length > 1 ? "primary.main" : "transparent",
        }}
      >
        <LightCard
          currentTimestamp={currentTimestamp}
          selectedState={selectedStates[lightIdx]}
          setSelectedState={(state: State) => updateSelectedState(state, lightIdx)}
          onDelete={() => onDeleteOne(lightIdx)}
          onMove={(amount) => onMove(lightIdx, amount)}
          light={lights[lightIdx]}
          lightConfig={lightConfigs[lightIdx]}
          expanded={expanded == lightIdx}
          onLightConfigChange={(lightConfig: LightConfig) =>
            updateLightConfig(lightConfig, lightIdx)
          }
          setExpanded={(expanded: boolean) => setExpanded(expanded ? lightIdx : null)}
        />
      </Box>
    )

    const groupButton =
      inGroupIdx < fixedLightGroups[groupIdx].length - 1
        ? splitButton(groupIdx, inGroupIdx, lightIdx)
        : joinButton(groupIdx, lightIdx)

    return lightIdx < lightConfigs.length - 1 ? [card, groupButton] : [card]
  })

  return (
    <Stack spacing={2} sx={{ p: 1, m: 1 }}>
      <IntersectionConfigPanel
        intersectionConfig={intersectionConfig}
        updateIntersectionConfig={updateIntersectionConfig}
        timeCorrection={timeCorrection}
        setTimeCorrection={setTimeCorrection}
        initTimeSync={initTimeSync}
      />

      <Stack spacing={0}>{intersectionGroups}</Stack>

      <Fullscreen
        enabled={uiMode == "fullscreen"}
        onDisabled={exitUiMode}
        lightGroups={theLightGroups}
        lights={lights}
        currentTimestamp={currentTimestamp}
      />

      <ShareDialog url={getShareUrl()} open={uiMode == "share"} onClose={exitUiMode} />

      {expanded != null && (
        <LightDetails
          open={expanded != null}
          currentTimestamp={currentTimestamp}
          light={lights[expanded]}
          lightConfig={lightConfigs[expanded]}
          selectedState={selectedStates[expanded]}
          onClose={() => setExpanded(null)}
          onLightConfigChange={(lightConfig: LightConfig) =>
            updateLightConfig(lightConfig, expanded)
          }
          setSelectedState={(state: State) => updateSelectedState(state, expanded)}
        />
      )}

      <Fab
        color="primary"
        aria-label="add"
        onClick={onAdd}
        style={{
          margin: 0,
          top: "auto",
          right: 20,
          bottom: 20,
          left: "auto",
          position: "fixed",
        }}
      >
        <AddIcon />
      </Fab>
    </Stack>
  )
}
