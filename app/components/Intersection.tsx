"use client"

import { useState, useEffect, ReactElement } from "react"
import Clock from "../domain/Clock"
import TrafficLight from "../domain/TrafficLight"
import LightConfig, {
  LightSettings,
  DEFAULT_LIGHT_SETTINGS,
} from "../domain/LightConfig"
import Failure from "../domain/Failure"
import { Box, Fab, Stack, useTheme } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import { LightSettingsParser, IntersectionSettingsParser } from "../url"
import IntersectionSettings, {
  DEFAULT_INTERSECTION_SETTINGS,
} from "../domain/IntersectionSettings"
import Fullscreen from "./Fullscreen"
import LightHead from "./LightHead"
import React from "react"
import ShareDialog from "./ShareDialog"
import timeSync from "../domain/timeSync"
import LightDetails from "./LightDetails"
import {
  createParser,
  Options,
  parseAsArrayOf,
  parseAsInteger,
  useQueryState,
} from "nuqs"
import IntersectionSettingsPanel from "./IntersectionSettingsPanel"
import { LightRecord } from "./LightCard"
import LightCard from "./LightCard"
import { State } from "../domain/State"
import LightGroups from "../domain/LightGroups"
import GroupButton from "./GroupButton"

export type UiMode = "none" | "share" | "fullscreen"
export type SelectionMode = "none" | "some" | "all" | "set-all" | "set-none"

const historyPush: Options = { history: "push" }

// TODOs
// cleanup light settings/config
// better ideas page
// back button a bit confusing in expand mode
// light pattern img
// preview mode (show groups in rows)
// Offline usage
// Manual time correction in cookie / local storage
// blink & beep
// fix the timeline range slider on edge (when expanding)
// breadcrumbs
// footer description
// android app

const LightGroupsParser = parseAsArrayOf(
  createParser(LightSettingsParser).withDefault([DEFAULT_LIGHT_SETTINGS]),
).withDefault([[DEFAULT_LIGHT_SETTINGS]])

export default function IntersectionComponent({
  uiMode,
  setUiMode,
}: {
  uiMode: UiMode
  setUiMode: (uiMode: UiMode) => void
}) {
  const [intersectionSettings, setIntersectionSettings] = useQueryState(
    "intersection",
    createParser(IntersectionSettingsParser).withDefault(
      DEFAULT_INTERSECTION_SETTINGS,
    ),
  )

  const [lightGroups, setLightGroups] = useQueryState(
    "lights",
    LightGroupsParser,
  )

  const [expanded, setExpanded] = useQueryState(
    "e",
    parseAsInteger.withOptions(historyPush),
  )

  const [timeCorrection, setTimeCorrection] = useState(0)

  const [currentTimestamp, setCurrentTimestamp] = useState(Date.now())

  const theLightGroups = new LightGroups(lightGroups)

  const lightConfigs = lightGroups.flatMap((x) => x).map((lightSetting) => new LightConfig(intersectionSettings, lightSetting))

  const [selectedStates, setSelectedStates] = useState(
    lightConfigs.map((lightConfig) => lightConfig.phases[0].state)
  )

  const theme = useTheme()

  const failure = new Failure(
    intersectionSettings.failure.duration,
    intersectionSettings.failure.probability,
  )

  const hasFailed = failure.currentState(currentTimestamp)

  const lights = lightConfigs.map(
    (lightConfig) => new TrafficLight(lightConfig, hasFailed),
  )

  const lightRecords: LightRecord[] = lightConfigs.map((_, index) => ({
    light: lights[index],
    lightConfig: lightConfigs[index],
    expanded: expanded == index,
    onLightSettingsChange: (settings: LightSettings) =>
      updateLightSettings(settings, index),
    setExpanded: (expanded: boolean) => setExpanded(expanded ? index : null),
  }))

  const clock = new Clock(timeCorrection)

  const updateLightSettings = (settings: LightSettings, index: number) => {
    setLightGroups(theLightGroups.withLightReplaced(index, settings).raw())
    setCurrentTimestamp(clock.now())
  }

  const updateSelectedState = (state: State, lightIdx: number) => {
    const copy = [...selectedStates]
    copy.splice(lightIdx, 1, state)
    setSelectedStates(copy)
  }

  const wrapListener = {
    nextStateTimestamp: (timestamp: number) =>
      (Math.floor(timestamp / intersectionSettings.cycleLength) + 1) *
      intersectionSettings.cycleLength,
  }

  const exitUiMode = () => setUiMode("none")

  const enterFullscreenMode = () => setUiMode("fullscreen")

  const enterShareMode = () => setUiMode("share")

  const initTimeSync = () =>
    timeSync()
      .then((correction) => setTimeCorrection(correction))
      .catch((e) => setTimeCorrection(0))

  const updateIntersectionSettings = (
    intersectionSettings: IntersectionSettings,
  ) => {
    setIntersectionSettings(intersectionSettings)
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
    setLightGroups(theLightGroups.withLightAdded(DEFAULT_LIGHT_SETTINGS).raw())
    setSelectedStates([
      ...selectedStates,
      DEFAULT_LIGHT_SETTINGS.phases[0].state,
    ])
    setExpanded(lightConfigs.length)
  }

  const onDeleteOne = (lightIdx: number) => {
    setLightGroups(theLightGroups.withLightDeleted(lightIdx).raw())
    setSelectedStates([...selectedStates].filter((ls, i) => i != lightIdx))
    setUiMode("none")
    setExpanded(null)
  }

  const getShareUrl = () => {
    const search = `?intersection=${IntersectionSettingsParser.serialize(intersectionSettings)}&lights=${LightGroupsParser.serialize(theLightGroups.raw())}`

    const baseUrl =
      typeof window === "undefined"
        ? process.env.NEXT_PUBLIC_SITE_URL
        : window.location.origin

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

  const splitButton = (
    groupIdx: number,
    splitIdx: number,
    lightIdx: number,
  ): ReactElement => (
    <GroupButton
      grouped={true}
      key={`group-button-${lightIdx}`}
      onClick={() => onSplit(groupIdx, splitIdx)}
      sx={{ ...groupBoxStyle, borderColor: "primary.main" }}
    />
  )

  const intersectionGroups = lightGroups.flatMap((lightGroup, groupIdx) => {
    const groupCards = lightGroup.flatMap((lightSetting, inGroupIdx) => {
      const lightIdx = theLightGroups.idLookup(groupIdx, inGroupIdx)
      const card = (
        <Box
          key={`light-${lightIdx}`}
          sx={{
            ...groupBoxStyle,
            borderColor: lightGroup.length > 1 ? "primary.main" : "transparent",
          }}
        >
          <LightCard
            currentTimestamp={currentTimestamp}
            selectedState={selectedStates[lightIdx]}
            setSelectedState={(state: State) =>
              updateSelectedState(state, lightIdx)
            }
            onDelete={() => onDeleteOne(lightIdx)}
            lightRecord={lightRecords[lightIdx]}
            onMove={(amount) => onMove(lightIdx, amount)}
          />
        </Box>
      )
      return inGroupIdx < lightGroup.length - 1
        ? [card, splitButton(groupIdx, inGroupIdx, lightIdx)]
        : [card]
    })

    const lightIdx = theLightGroups.idLookup(groupIdx, lightGroup.length - 1)

    return groupIdx < lightGroups.length - 1
      ? [...groupCards, joinButton(groupIdx, lightIdx)]
      : groupCards
  })

  const fullscreenContents = lights.map((light, index) => (
    <LightHead
      key={`fullscreen-light-${index}`}
      currentTimestamp={currentTimestamp}
      light={light}
      lightConfig={light.lightConfig}
      maxHeight={100}
      maxWidth={100}
    />
  ))

  return (
    <Stack spacing={2} sx={{ p: 1, m: 1 }}>
      <IntersectionSettingsPanel
        intersectionSettings={intersectionSettings}
        updateIntersectionSettings={updateIntersectionSettings}
        timeCorrection={timeCorrection}
        setTimeCorrection={setTimeCorrection}
        initTimeSync={initTimeSync}
      />

      <Stack spacing={0}>{intersectionGroups}</Stack>

      <Fullscreen
        enabled={uiMode == "fullscreen"}
        onDisabled={exitUiMode}
        lightGroups={theLightGroups}
      >
        {fullscreenContents}
      </Fullscreen>

      <ShareDialog
        url={getShareUrl()}
        open={uiMode == "share"}
        onClose={exitUiMode}
      />

      {expanded != null && (
        <LightDetails
          open={expanded != null}
          currentTimestamp={currentTimestamp}
          light={lights[expanded]}
          lightConfig={lightConfigs[expanded]}
          selectedState={selectedStates[expanded]}
          onClose={() => setExpanded(null)}
          onLightSettingsChange={(settings: LightSettings) =>
            updateLightSettings(settings, expanded)
          }
          onFullscreen={enterFullscreenMode}
          onDelete={() => onDeleteOne(expanded)}
          onShare={enterShareMode}
          setSelectedState={(state: State) =>
            updateSelectedState(state, expanded)
          }
          lightRecord={lightRecords[expanded]}
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
