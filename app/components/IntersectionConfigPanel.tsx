"use client"

import Input from "./Input"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Divider,
  Stack,
  Typography,
} from "@mui/material"
import IntersectionConfig from "../domain/IntersectionConfig"
import React from "react"
import TuneIcon from "@mui/icons-material/Tune"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import SyncIcon from "@mui/icons-material/Sync"

export default function IntersectionSettingsPanel({
  intersectionConfig,
  updateIntersectionConfig,
  timeCorrection,
  setTimeCorrection,
  initTimeSync,
}: {
  intersectionConfig: IntersectionConfig
  updateIntersectionConfig: (intersectionConfig: IntersectionConfig) => void
  timeCorrection: number
  setTimeCorrection: (timeCorrection: number) => void
  initTimeSync: () => void
}) {
  const { cycleLength, failure } = intersectionConfig
  const summary = `${cycleLength / 1000} s cycle · ${Math.round(failure.probability * 100)}% failure chance`

  return (
    <Accordion
      disableGutters
      variant="outlined"
      sx={{ borderRadius: "16px", "&::before": { display: "none" } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <TuneIcon color="action" />
          <div>
            <Typography sx={{ fontWeight: 600 }}>Intersection settings</Typography>
            <Typography variant="body2" color="text.secondary">
              {summary}
            </Typography>
          </div>
        </Stack>
      </AccordionSummary>

      <AccordionDetails>
        <Stack spacing={2}>
          <Input
            label="Cycle length (s)"
            id="cycle-length"
            min={10}
            max={180}
            value={cycleLength / 1000}
            onChange={(e) =>
              updateIntersectionConfig({
                ...intersectionConfig,
                cycleLength: e.target.value * 1000,
              })
            }
          />
          <Divider />
          <Typography variant="body2" color="text.secondary">
            Every now and then the lights can break down and blink yellow, just like real ones.
          </Typography>
          <Input
            label="Failure probability (%)"
            id="failure-probability"
            min={0}
            max={100}
            step={5}
            value={Math.round(failure.probability * 100)}
            onChange={(e) =>
              updateIntersectionConfig({
                ...intersectionConfig,
                failure: { ...failure, probability: e.target.value / 100 },
              })
            }
          />
          <Input
            label="Failure duration (s)"
            id="failure-duration"
            min={10}
            max={180}
            value={failure.duration / 1000}
            onChange={(e) =>
              updateIntersectionConfig({
                ...intersectionConfig,
                failure: { ...failure, duration: e.target.value * 1000 },
              })
            }
          />
          <Divider />
          <Typography variant="body2" color="text.secondary">
            Phones stay in sync using their clocks. If one runs ahead or behind, sync it with
            internet time or nudge it by hand.
          </Typography>
          <Input
            label="Time correction (s)"
            id="time-correction"
            min={-2}
            max={2}
            step={0.05}
            value={timeCorrection / 1000}
            onChange={(e) => setTimeCorrection(e.target.value * 1000)}
          />
          <div>
            <Button variant="outlined" startIcon={<SyncIcon />} onClick={initTimeSync}>
              Sync with internet time
            </Button>
          </div>
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}
