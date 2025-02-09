"use client"

import { useState, useEffect, ReactElement } from "react"
import Clock from "../domain/Clock"
import TrafficLight from "../domain/TrafficLight"
import LightConfig, {
  LightSettings,
  DEFAULT_LIGHT_SETTINGS,
} from "../domain/LightConfig"
import Failure from "../domain/Failure"
import { Box, Button, Fab, Stack, useTheme } from "@mui/material"
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
import CompressIcon from "@mui/icons-material/Compress"
import ExpandIcon from "@mui/icons-material/Expand"
import LightCard from "./LightCard"
import { State } from "../domain/State"

export type UiMode = "none" | "share" | "fullscreen"
export type SelectionMode = "none" | "some" | "all" | "set-all" | "set-none"

const historyPush: Options = { history: "push" }

// TODOs
// merge grouping / light parameter
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

  const [lightSettings, setLightSettings] = useQueryState(
    "lights",
    createParser(LightSettingsParser).withDefault([DEFAULT_LIGHT_SETTINGS]),
  )

  const [grouping, setGrouping] = useQueryState<number[][]>(
    "groups",
    parseAsArrayOf(parseAsArrayOf(parseAsInteger)).withDefault(
      lightSettings.map((_, index) => [index]),
    ),
  )

  const [expanded, setExpanded] = useQueryState(
    "e",
    parseAsInteger.withOptions(historyPush),
  )

  const [timeCorrection, setTimeCorrection] = useState(0)

  const [currentTimestamp, setCurrentTimestamp] = useState(Date.now())

  const [selected, setSelected] = useState<number[]>([])

  const effectivelySelected =
    selected.length == 0 ? lightSettings.map((ls, index) => index) : selected

  const [selectedStates, setSelectedStates] = useState(
    lightSettings.map((ls) => ls.phases[0].state),
  )

  const theme = useTheme()

  const failure = new Failure(
    intersectionSettings.failure.duration,
    intersectionSettings.failure.probability,
  )

  const hasFailed = failure.currentState(currentTimestamp)

  const lightConfigs = lightSettings.map(
    (lightSetting) => new LightConfig(intersectionSettings, lightSetting),
  )

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
    const copy = [...lightSettings]
    copy.splice(index, 1, settings)
    setLightSettings(copy)
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

  const enterUiMode = (idx: number[], uiMode: UiMode) => {
    setSelected(idx)
    setUiMode(uiMode)
  }

  const exitUiMode = () => {
    setUiMode("none")
    setSelected([])
  }

  const enterFullscreenMode = (idx: number[]) => {
    enterUiMode(idx, "fullscreen")
  }

  const enterShareMode = (idx: number[]) => {
    enterUiMode(idx, "share")
  }

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

  const onUngroup = (groupIdx: number, splitIdx: number) => {
    const groupLeft = grouping[groupIdx].filter((x, idx) => idx <= splitIdx)
    const groupRight = grouping[groupIdx].filter((x, idx) => idx > splitIdx)
    const newGrouping = grouping.flatMap((group, idx) =>
      idx == groupIdx ? [groupLeft, groupRight] : [group],
    )
    setGrouping(newGrouping)
  }

  const onGroupDown = (groupIdx: number) => {
    const initAcc: number[][] = []
    const newGrouping = grouping.reduce(
      (acc, group, idx) =>
        idx != groupIdx + 1
          ? [...acc, group]
          : [...acc.slice(0, -1), [...acc[acc.length - 1], ...group]],
      initAcc,
    )
    setGrouping(newGrouping)
  }

  const onMove = (lightIdx: number, amount: number) => {
    const moveArr = (arr: any[], lightIdx: number, amount: number) => {
      if (lightIdx + amount < 0 || lightIdx + amount >= arr.length) {
        return arr
      }
      return arr
        .filter((_, i) => i != lightIdx)
        .toSpliced(lightIdx + amount, 0, arr[lightIdx])
    }
    setLightSettings(moveArr(lightSettings, lightIdx, amount))
    setSelectedStates(moveArr(selectedStates, lightIdx, amount))
  }

  const onAdd = () => {
    setLightSettings([...lightSettings, DEFAULT_LIGHT_SETTINGS])
    setSelectedStates([
      ...selectedStates,
      DEFAULT_LIGHT_SETTINGS.phases[0].state,
    ])
    setExpanded(lightSettings.length)
    setGrouping([...grouping, [lightSettings.length]])
  }

  const onDeleteOne = (lightIdx: number) => {
    const newGrouping = [...grouping]
      .map((group) =>
        group
          .filter((light) => light != lightIdx)
          .map((light) => (light < lightIdx ? light : light - 1)),
      )
      .filter((group) => group.length > 0)
    setLightSettings([...lightSettings].filter((ls, i) => i != lightIdx))
    setSelectedStates([...selectedStates].filter((ls, i) => i != lightIdx))
    setUiMode("none")
    setExpanded(null)
    setGrouping(newGrouping)
  }

  const getShareUrl = () => {
    const selectedLightSettings = lightSettings.filter((ls, index) =>
      effectivelySelected.includes(index),
    )

    const search = `?intersection=${IntersectionSettingsParser.serialize(intersectionSettings)}&lights=${LightSettingsParser.serialize(selectedLightSettings)}`

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

  const joinButton = (groupIdx: number): ReactElement => (
    <Box
      key={`join-${groupIdx}`}
      sx={{ ...groupBoxStyle, borderColor: "transparent" }}
    >
      <Button
        onClick={() => onGroupDown(groupIdx)}
        startIcon={<CompressIcon />}
      >
        Group
      </Button>
    </Box>
  )

  const splitButton = (groupIdx: number, splitIdx: number): ReactElement => (
    <Box
      key={`split-${groupIdx}-${splitIdx}`}
      sx={{ ...groupBoxStyle, borderColor: "primary.main" }}
    >
      <Button
        onClick={() => onUngroup(groupIdx, splitIdx)}
        startIcon={<ExpandIcon />}
      >
        Split
      </Button>
    </Box>
  )

  const intersectionGroups = grouping.flatMap((lightIndices, groupIdx) => {
    const groupCards = lightIndices.flatMap((lightIdx, inGroupIdx) => {
      const card = (
        <Box
          key={`light-${lightIdx}`}
          sx={{
            ...groupBoxStyle,
            borderColor:
              lightIndices.length > 1 ? "primary.main" : "transparent",
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
      return inGroupIdx < lightIndices.length - 1
        ? [card, splitButton(groupIdx, inGroupIdx)]
        : [card]
    })

    return groupIdx < grouping.length - 1
      ? [...groupCards, joinButton(groupIdx)]
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
        grouping={grouping}
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
          onFullscreen={() => enterFullscreenMode([expanded])}
          onDelete={() => onDeleteOne(expanded)}
          onShare={() => enterShareMode([expanded])}
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
