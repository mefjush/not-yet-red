"use client"

import { useState, useEffect, useRef } from "react"
import Clock from "../domain/Clock"
import TrafficLight from "../domain/TrafficLight"
import LightConfig, { DEFAULT_LIGHT_CONFIG } from "../domain/LightConfig"
import Failure from "../domain/Failure"
import {
  Alert,
  Button,
  Container,
  Box,
  GlobalStyles,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import AddIcon from "@mui/icons-material/Add"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import IosShareIcon from "@mui/icons-material/IosShare"
import { lightConfigParser, IntersectionConfigParser, setupCode } from "../url"
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
import PhoneSection from "./PhoneSection"
import useHydrated from "../hooks/useHydrated"

export type UiMode = "none" | "share" | "fullscreen"

const historyPush: Options = { history: "push" }

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

  const [timestamp, setCurrentTimestamp] = useState(() => Date.now())
  const currentTimestamp = useHydrated() ? timestamp : 0

  const fixedLightGroups = lightGroups.map((lg) =>
    lg.map((lc) => lc.withIntersectionConfig(intersectionConfig)),
  )

  const theLightGroups = new LightGroups(fixedLightGroups)

  const lightConfigs = fixedLightGroups.flatMap((x) => x)

  const [selectedStates, setSelectedStates] = useState(
    lightConfigs.map((lightConfig) => lightConfig.phases[0].state),
  )

  const [undo, setUndo] = useState<null | (() => void)>(null)

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

  const onMoveToPhone = (lightIdx: number, groupIdx: number) => {
    // regroup the selected states the same way so they stay aligned with their lights
    const stateGroups = new LightGroups(
      fixedLightGroups.map((group, gi) =>
        group.map((_, ii) => selectedStates[theLightGroups.idLookup(gi, ii)]),
      ),
    )
    setLightGroups(theLightGroups.withLightMoved(lightIdx, groupIdx).raw())
    setSelectedStates(stateGroups.withLightMoved(lightIdx, groupIdx).raw().flat())
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

  // The editor is a history entry, so the phone's back button closes it. Every other way of
  // closing it goes back too, so closed editors never pile up in history to be reopened.
  // A page opened with the editor already open has no entry of ours to go back to.
  const editorPushed = useRef(false)
  const openEditor = (lightIdx: number) => {
    editorPushed.current = true
    setExpanded(lightIdx)
  }
  const closeEditor = () => {
    if (editorPushed.current) {
      window.history.back()
    } else {
      setExpanded(null, { history: "replace" })
    }
  }

  // Edits made in the editor live in its history entry; going back returns to the entry from
  // before it opened, with the lights from before the edits. Track the lights before and during
  // the editor, and when it closes and the lights jump back to "before", put the edits back.
  const lightsQuery = lightGroupsParser.serialize(theLightGroups.raw())
  const previous = useRef({ expanded, lights: lightsQuery })
  const editorLights = useRef<{ before: string; latest: string } | null>(null)
  const pendingRestore = useRef<{ before: string; latest: string } | null>(null)
  useEffect(() => {
    const was = previous.current
    previous.current = { expanded, lights: lightsQuery }

    if (expanded != null) {
      if (was.expanded == null) {
        editorLights.current = { before: was.lights, latest: lightsQuery }
      } else if (editorLights.current && lightsQuery != editorLights.current.before) {
        // "before" again while still open is the revert arriving early, not an edit
        editorLights.current.latest = lightsQuery
      }
      return
    }

    if (was.expanded != null && editorLights.current) {
      const closed = editorLights.current
      editorLights.current = null
      editorPushed.current = false
      pendingRestore.current = closed
      // the old address may arrive a moment later; give up if it never does
      setTimeout(() => {
        if (pendingRestore.current == closed) pendingRestore.current = null
      }, 1000)
    }

    const pending = pendingRestore.current
    if (pending && lightsQuery == pending.before && pending.latest != pending.before) {
      pendingRestore.current = null
      setLightGroups(lightGroupsParser.parse(pending.latest))
    }
  })

  // defaults to adding a new phone
  const onAdd = (groupIdx = fixedLightGroups.length) => {
    const updated = theLightGroups.withLightAdded(DEFAULT_LIGHT_CONFIG, groupIdx)
    const newIdx = updated.idLookup(groupIdx, updated.raw()[groupIdx].length - 1)
    setLightGroups(updated.raw())
    setSelectedStates(selectedStates.toSpliced(newIdx, 0, DEFAULT_LIGHT_CONFIG.phases[0].state))
    openEditor(newIdx)
  }

  const onDeleteOne = (lightIdx: number) => {
    const previousGroups = theLightGroups.raw()
    const previousStates = selectedStates
    setLightGroups(theLightGroups.withLightDeleted(lightIdx).raw())
    setSelectedStates([...selectedStates].filter((ls, i) => i != lightIdx))
    setUiMode("none")
    if (expanded != null) closeEditor()
    setUndo(() => () => {
      setLightGroups(previousGroups)
      setSelectedStates(previousStates)
    })
  }

  // everything other phones need to run the same intersection
  const setupQuery = `?intersection=${IntersectionConfigParser.serialize(intersectionConfig)}&lights=${lightGroupsParser.serialize(theLightGroups.raw())}`
  const code = setupCode(setupQuery)

  // the setup other phones are likely running: the one this phone opened from a link,
  // or the one it last shared. null until then, so a brand-new setup doesn't nag.
  const [syncedCode, setSyncedCode] = useState<string | null>(() =>
    typeof window != "undefined" && new URLSearchParams(window.location.search).has("lights")
      ? code
      : null,
  )
  const outOfSync = syncedCode != null && syncedCode != code

  const getShareUrl = () => {
    const search = setupQuery

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

  const phones = fixedLightGroups.map((group, groupIdx) => (
    <PhoneSection key={groupIdx} index={groupIdx} onAddLight={() => onAdd(groupIdx)}>
      {group.map((_, inGroupIdx) => {
        const lightIdx = theLightGroups.idLookup(groupIdx, inGroupIdx)
        return (
          <LightCard
            key={`light-${lightIdx}`}
            timeCorrection={timeCorrection}
            index={lightIdx}
            phoneIdx={groupIdx}
            phoneCount={fixedLightGroups.length}
            aloneOnPhone={group.length == 1}
            canMoveUp={inGroupIdx > 0}
            canMoveDown={inGroupIdx < group.length - 1}
            currentTimestamp={currentTimestamp}
            selectedState={selectedStates[lightIdx]}
            setSelectedState={(state: State) => updateSelectedState(state, lightIdx)}
            onDelete={() => onDeleteOne(lightIdx)}
            onMove={(amount) => onMove(lightIdx, amount)}
            onMoveToPhone={(toGroupIdx) => onMoveToPhone(lightIdx, toGroupIdx)}
            light={lights[lightIdx]}
            lightConfig={lightConfigs[lightIdx]}
            expanded={expanded == lightIdx}
            onLightConfigChange={(lightConfig: LightConfig) =>
              updateLightConfig(lightConfig, lightIdx)
            }
            setExpanded={(open: boolean) => (open ? openEditor(lightIdx) : closeEditor())}
          />
        )
      })}
    </PhoneSection>
  ))

  const emptyState = (
    <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h6" gutterBottom>
        No traffic lights yet
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Add a light, then open this page on another phone to build an intersection.
      </Typography>
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => onAdd()}>
        Add a traffic light
      </Button>
    </Paper>
  )

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Stack spacing={2}>
        {outOfSync && (
          <Alert
            severity="warning"
            action={
              <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                <Button color="inherit" size="small" onClick={() => setUiMode("share")}>
                  Share again
                </Button>
                <IconButton
                  color="inherit"
                  size="small"
                  aria-label="Dismiss"
                  onClick={() => setSyncedCode(code)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
            }
          >
            Setup changed (now {code}). If other phones use this intersection, share it again so
            they match.
          </Alert>
        )}
        <IntersectionConfigPanel
          intersectionConfig={intersectionConfig}
          updateIntersectionConfig={updateIntersectionConfig}
          timeCorrection={timeCorrection}
          setTimeCorrection={setTimeCorrection}
          initTimeSync={initTimeSync}
        />

        {lightConfigs.length == 0 ? (
          emptyState
        ) : (
          <>
            {phones}
            <div>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={() => onAdd()}>
                Add phone
              </Button>
            </div>
          </>
        )}
      </Stack>

      <Fullscreen
        enabled={uiMode == "fullscreen"}
        onDisabled={exitUiMode}
        lightGroups={theLightGroups}
        lights={lights}
        currentTimestamp={currentTimestamp}
        timeCorrection={timeCorrection}
        setupCode={code}
      />

      <ShareDialog
        url={getShareUrl()}
        code={code}
        open={uiMode == "share"}
        onClose={() => {
          // whoever scanned it now runs this setup
          setSyncedCode(code)
          exitUiMode()
        }}
      />

      {expanded != null && lights[expanded] && (
        <LightDetails
          open={expanded != null}
          timeCorrection={timeCorrection}
          index={expanded}
          currentTimestamp={currentTimestamp}
          light={lights[expanded]}
          lightConfig={lightConfigs[expanded]}
          selectedState={selectedStates[expanded]}
          onClose={closeEditor}
          onLightConfigChange={(lightConfig: LightConfig) =>
            updateLightConfig(lightConfig, expanded)
          }
          setSelectedState={(state: State) => updateSelectedState(state, expanded)}
        />
      )}

      <Snackbar
        // above the bottom bar
        sx={{ bottom: "calc(88px + env(safe-area-inset-bottom)) !important" }}
        open={undo != null}
        autoHideDuration={8000}
        onClose={() => setUndo(null)}
        message="Light deleted"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              undo?.()
              setUndo(null)
            }}
          >
            Undo
          </Button>
        }
      />

      {/* keep the page footer clear of the bottom bar while this screen is shown */}
      <GlobalStyles
        styles={{ body: { paddingBottom: "calc(80px + env(safe-area-inset-bottom))" } }}
      />
      {/* the next steps, always in reach: share the setup, then start playing.
          "mui-fixed" lets dialogs pad it like the page when they hide the scrollbar,
          so the buttons don't jump sideways */}
      <Box
        className="mui-fixed"
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: "appBar",
          borderTop: 1,
          borderColor: "divider",
          bgcolor: "rgba(var(--mui-palette-background-defaultChannel) / 0.85)",
          backdropFilter: "blur(12px)",
          pt: 1.5,
          pb: "max(12px, env(safe-area-inset-bottom))",
        }}
      >
        <Container maxWidth="md">
          <Stack direction="row" spacing={1.5}>
            <Button
              fullWidth
              size="large"
              variant="outlined"
              startIcon={<IosShareIcon />}
              disabled={lightConfigs.length == 0}
              onClick={() => setUiMode("share")}
            >
              Share to phones
            </Button>
            <Button
              fullWidth
              size="large"
              variant="contained"
              startIcon={<PlayArrowIcon />}
              disabled={lightConfigs.length == 0}
              onClick={() => setUiMode("fullscreen")}
            >
              Start
            </Button>
          </Stack>
        </Container>
      </Box>
    </Container>
  )
}
