"use client"

import { useState } from 'react'
import Input from './Input'
import { Card, CardContent, Collapse, Box, Button, Tabs, Tab } from '@mui/material'
import IntersectionSettings from '../domain/IntersectionSettings'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import React from 'react'
import GridGoldenratioIcon from '@mui/icons-material/GridGoldenratio'

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

  const [selectedTab, setSelectedTab] = useState<number | false>(false)

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
      onClick: () => setSelectedTab(index === selectedTab ? false : index),
    }
  }

  return (
    <Card>
      <Tabs value={selectedTab} aria-label="basic tabs example">
        <Tab icon={<GridGoldenratioIcon />} label='Intersection' iconPosition='top' {...a11yProps(0)} />
        <Tab icon={<AccessTimeIcon />} label='Time' iconPosition='top' {...a11yProps(1)} />
      </Tabs>

      <Collapse in={selectedTab === 0} unmountOnExit>
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
        </CardContent>
      </Collapse>
      <Collapse in={selectedTab === 1} unmountOnExit>
        <CardContent>
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
