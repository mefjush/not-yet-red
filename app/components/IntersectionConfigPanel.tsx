"use client"

import { useState } from "react"
import Input from "./Input"
import { Card, CardContent, Collapse, Button, CardActions, CardActionArea } from "@mui/material"
import IntersectionConfig from "../domain/IntersectionConfig"
import React from "react"
import SettingsIcon from "@mui/icons-material/Settings"

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
  const [expanded, setExpanded] = useState(false)

  return (
    <Card>
      <CardActionArea onClick={() => setExpanded(!expanded)}>
        <CardActions>
          <Button
            disableFocusRipple
            disableRipple
            disableElevation
            component="div"
            size="large"
            startIcon={<SettingsIcon />}
          >
            Settings
          </Button>
        </CardActions>
      </CardActionArea>

      <Collapse in={expanded}>
        <CardContent>
          <Input
            label="Cycle length (s)"
            id="cycle-length"
            min={10}
            max={180}
            value={intersectionConfig.cycleLength / 1000}
            onChange={(e) =>
              updateIntersectionConfig({
                ...intersectionConfig,
                cycleLength: Number(e.target.value) * 1000,
              })
            }
          />
          <Input
            label="Failure duration (s)"
            id="failure-duration"
            min={10}
            max={180}
            value={intersectionConfig.failure.duration / 1000}
            onChange={(e) =>
              updateIntersectionConfig({
                ...intersectionConfig,
                failure: {
                  probability: intersectionConfig.failure.probability,
                  duration: Number(e.target.value) * 1000,
                },
              })
            }
          />
          <Input
            label="Failure probability (%)"
            id="failure-probability"
            min={0}
            max={100}
            step={5}
            value={Math.round(intersectionConfig.failure.probability * 100)}
            onChange={(e) =>
              updateIntersectionConfig({
                ...intersectionConfig,
                failure: {
                  duration: intersectionConfig.failure.duration,
                  probability: Number(e.target.value) / 100,
                },
              })
            }
          />
          <Input
            label="Time correction (s)"
            id="time-correction"
            min={-2}
            max={2}
            step={0.05}
            value={timeCorrection / 1000}
            onChange={(e) => setTimeCorrection(e.target.value * 1000)}
          />
          <Button variant="outlined" onClick={initTimeSync}>
            Sync time
          </Button>
        </CardContent>
      </Collapse>
    </Card>
  )
}
