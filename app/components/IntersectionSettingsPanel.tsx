"use client"

import { useState } from 'react'
import Input from './Input'
import { Card, CardContent, Collapse, Box, Button, Tabs, Tab } from '@mui/material'
import IntersectionSettings from '../domain/IntersectionSettings'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import React from 'react'
import GridGoldenratioIcon from '@mui/icons-material/GridGoldenratio'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number | false
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <Collapse in={value == index} unmountOnExit>
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box>{children}</Box>}
      </div>
    </Collapse>
  )
}

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

  const handleTabChange = (newValue: number) => {
    setSelectedTab(newValue === selectedTab ? false : newValue)
  }

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
      onClick: () => handleTabChange(index),
    }
  }

  return (
    <Card>
      <Tabs value={selectedTab} aria-label="basic tabs example">
        <Tab icon={<GridGoldenratioIcon />} label='Intersection' iconPosition='top' {...a11yProps(0)} />
        <Tab icon={<AccessTimeIcon />} label='Time' iconPosition='top' {...a11yProps(1)} />
      </Tabs>

      <CustomTabPanel value={selectedTab} index={0}>
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
      </CustomTabPanel>
      <CustomTabPanel value={selectedTab} index={1}>
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
      </CustomTabPanel>
    </Card>
  )
}
