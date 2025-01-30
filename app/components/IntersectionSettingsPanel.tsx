"use client"

import { useState } from 'react'
import Input from './Input'
import { Card, CardContent, Collapse, Box, Button, Tabs, Tab, IconButton, CardHeader, CardActions, CardActionArea, Stack, Typography } from '@mui/material'
import IntersectionSettings from '../domain/IntersectionSettings'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import React from 'react'
import GridGoldenratioIcon from '@mui/icons-material/GridGoldenratio'
import SettingsIcon from '@mui/icons-material/Settings'
import Grid from '@mui/material/Grid2'

export default function IntersectionSettingsPanel({ 
  intersectionSettings, 
  updateIntersectionSettings,
  timeCorrection,
  setTimeCorrection,
  initTimeSync
}: { 
  intersectionSettings: IntersectionSettings, 
  updateIntersectionSettings: (intersectionSettings: IntersectionSettings) => void,
  timeCorrection: number,
  setTimeCorrection: (timeCorrection: number) => void,
  initTimeSync: () => void
}) {

  const [expanded, setExpanded] = useState(false)

  return (
    <Card>
      <CardActionArea onClick={() => setExpanded(!expanded)}>
        <CardActions>
          <Button component='div' size='large' startIcon={<SettingsIcon/>}>Settings</Button>
          {/* <Stack sx={{ m: 1 }} direction='row' spacing={1} alignItems='center'>
            <SettingsIcon size='large' />
            <Typography component='div' variant='h6'>Settings</Typography>
          </Stack> */}
        </CardActions>
      </CardActionArea>

      <Collapse in={expanded}>
        <CardContent>
          <Input 
            label="Cycle length (s)"
            id="cycle-length" 
            min={10}
            max={180}
            value={intersectionSettings.cycleLength / 1000} 
            onChange={ e => updateIntersectionSettings({ ...intersectionSettings, cycleLength: Number(e.target.value) * 1000 }) } 
          />
          <Input 
            label="Failure duration (s)"
            id="failure-duration" 
            min={10}
            max={180}
            value={intersectionSettings.failure.duration / 1000} 
            onChange={ e => updateIntersectionSettings({ ...intersectionSettings, failure: { probability: intersectionSettings.failure.probability, duration: Number(e.target.value) * 1000 } }) } 
          />
          <Input 
            label="Failure probability (%)"
            id="failure-probability" 
            min={0}
            max={100}
            step={5}
            value={Math.round(intersectionSettings.failure.probability * 100)} 
            onChange={ e => updateIntersectionSettings({ ...intersectionSettings, failure: { duration: intersectionSettings.failure.duration, probability: Number(e.target.value) / 100 } }) } 
          />
          <Input 
            label="Time correction (s)" 
            id="time-correction" 
            min={-2}
            max={2}
            step={0.05}
            value={timeCorrection / 1000} 
            onChange={e => setTimeCorrection(e.target.value * 1000)} 
          />
          <Button variant='outlined' onClick={initTimeSync}>Sync time</Button>
        </CardContent>
      </Collapse>
    </Card>
  )
}
