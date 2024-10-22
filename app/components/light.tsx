"use client"

import TrafficLight from '../domain/traffic-light'
import LightConfig, { LightSettings } from '../domain/light-config'
import { IconButton, Card, CardActions, CardContent, Stack, Box, CardHeader, Avatar, Collapse, Slider, Typography, SlotComponentProps, SliderComponentsPropsOverrides, SliderOwnerState, Checkbox, Tabs, Tab } from '@mui/material'
import Grid from '@mui/material/Grid2'
import DeleteIcon from '@mui/icons-material/Delete'
import ShareIcon from '@mui/icons-material/Share'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useEffect, useRef, useState } from 'react'
import Tune from './tune'
import { CrossingSettingsSerDeser, LightSettingsSerDeser } from '../url'
import { ExpandMore } from './expand-more'
import ShareDialog from './share-dialog'
import PhaseControls from './phase-controls'
import LightIcon from './light-icon'


export default function LightComponent({ index, currentTimestamp, light, lightConfig, onLightSettingsChange, onDelete }: { index: number, currentTimestamp: number, light: TrafficLight, lightConfig: LightConfig, onLightSettingsChange: (lightSettings: LightSettings) => void, onDelete?: () => void }) {

  const fullscreenRef = useRef<HTMLDivElement>(null)

  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null)
  const [shareMode, setShareMode] = useState(false)
  const [fullscreenMode, setFullscreenMode] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [markTransition, setMarkerTransition] = useState(0)

  const handleExpandClick = () => {
    setExpanded(!expanded);
  }

  const deleteButton = onDelete == null ? <></> : <IconButton aria-label="delete" onClick={() => onDelete()} style={{marginLeft: 'auto'}}><DeleteIcon /></IconButton>

  const currentPhase = light.currentPhase(currentTimestamp)

  // const lightImg = (
  //   <img 
  //     className="the-traffic-light" 
  //     src={currentPhase.stateAttributes().file} 
  //     alt={currentPhase.stateAttributes().name} 
  //     style={{ maxWidth: "100%", maxHeight: fullscreenMode ? "100vh" : "200px", height: fullscreenMode ? "100vh" : "auto" }} 
  //   />
  // )

  const search = `?crossing=${CrossingSettingsSerDeser.serialize(lightConfig.crossingSettings)}&lights=${LightSettingsSerDeser.serialize([lightConfig.toLightSettings()])}`

  const baseUrl = typeof window === "undefined" ? process.env.NEXT_PUBLIC_SITE_URL : window.location.origin
  // const baseUrl = "http://192.168.0.106:3000" 
  const url = baseUrl + search

  const requestWakeLock = async () => {
    try {
      if (navigator && navigator.wakeLock) {
        const wakeLock = await navigator.wakeLock.request()
        setWakeLock(wakeLock)
      }
    } catch (err: any) {
      alert(`${err.name}, ${err.message}`)
      console.error(`${err.name}, ${err.message}`)
    }
  }

  const releaseWakeLock = async () => {
    // TODO this does not seem to work!

    if (!wakeLock) {
      return
    }
    try {
      wakeLock.release()
      setWakeLock(null)
    } catch (err: any) {
      console.error(`${err.name}, ${err.message}`)
    }
  }

  const enterFullScreen = () => {
    requestWakeLock()
    fullscreenRef.current?.requestFullscreen().finally(() => {
      fullscreenRef.current?.addEventListener("fullscreenchange", (event) => {
        if (document['fullscreenElement'] == null) {
          setFullscreenMode(false)
          releaseWakeLock()
        }
      });
    })
  }

  let durationInputs = lightConfig.phases.toSorted((a, b) => a.stateAttributes().priority - b.stateAttributes().priority).reverse().map(phase => (
    <PhaseControls 
      key={`light-${index}-${phase.stateAttributes().name}-duration`} 
      label={`${phase.stateAttributes().name} duration`} 
      id={`light-${index}-${phase.stateAttributes().name}-duration`} 
      min={0} 
      max={lightConfig.cycleLength() / 1000} 
      value={phase.duration / 1000} 
      onChange={e => onLightSettingsChange(lightConfig.withStateDuration(phase.state, e.target.value * 1000))} 
      color={phase.stateAttributes().color}
    />
  ))

  let avatar = (
    <Box>
      {/* <Checkbox /> */}
      {/* <Avatar 
        aria-label="traffic-light" 
        sx={{ bgcolor: `${currentPhase.stateAttributes().color}.main` }}
      >
    </Avatar> */}
      
    </Box>
  )

  let title = (
    <Box sx={{ mx: 2 }}>
      <Typography gutterBottom>
        Traffic Light #{index}
      </Typography>
    </Box>
  )

  const markPosition = currentTimestamp % lightConfig.cycleLength()

  const needsTransition = markTransition == markPosition

  const transitionDuration = needsTransition ? lightConfig.cycleLength() - markPosition : 0
  const markPositionToSet = needsTransition ? lightConfig.cycleLength() : markPosition

  useEffect(() => {
    setMarkerTransition(markPosition)
  }, [markPosition])

  useEffect(() => {
    if (fullscreenMode) {
      enterFullScreen()
    }
  }, [fullscreenMode])

  const lightIcon = <LightIcon currentTimestamp={currentTimestamp} light={light} size={ expanded ? 50 : 10 } display={'block'} />
  
  return (
    <Card>
      <CardActions>
        <Checkbox />
        {/* {avatar} */}
        {lightIcon}
        <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
            style={{marginLeft: 'auto'}}
          >
            <ExpandMoreIcon />
          </ExpandMore>
        {/* <IconButton aria-label="fullscreen" onClick={() => setFullscreenMode(true)}><FullscreenIcon /></IconButton>
        <IconButton aria-label="share" onClick={() => setShareMode(!shareMode) }><ShareIcon /></IconButton>
        {deleteButton} */}
      </CardActions>
      {/* <CardHeader
        // avatar={avatar}
        action={
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        }
        title={title}
      >
      </CardHeader> */}

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Grid container sx={{ justifyContent: "space-between", alignItems: "center" }} spacing={4}>
            <Grid size={{ xs: 12, md: 2, lg: 1 }} display="flex" justifyContent="center" alignItems="center">
              {/* {lightImg} */}
              {/* <LightIcon currentTimestamp={currentTimestamp} light={light} size={ expanded ? 50 : 10 } display='block'/> */}
              {/* {lightIcon} */}
            </Grid>
            <Grid size={{ xs: 12, md: 10, lg: 11 }}>
              <Stack direction="column" alignItems="stretch">
                <Typography gutterBottom>
                  Phases
                </Typography>
                <form>
                  {durationInputs}
                </form>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Collapse>

      <Box sx={{ mx: 2 }}>
        <Typography gutterBottom>
          Offset
        </Typography>
        <Slider
          value={lightConfig.offset / 1000}
          step={1}
          min={0} 
          max={(lightConfig.cycleLength() / 1000)}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value} s`}
          onChange={(e, newValue) => onLightSettingsChange(lightConfig.withOffset(newValue as number * 1000))}
          aria-label="Offset"
          slots={{ 
            track: Tune 
          }}
          slotProps={{ 
            track: { lightConfig: lightConfig, onLightSettingsChange: onLightSettingsChange } as SliderComponentsPropsOverrides,
            rail: { style: { display: "none" } },
            mark: { style: { display: "none" } },
            markLabel: { style: { transitionDuration: `${transitionDuration}ms`, transitionTimingFunction: 'linear' } }
          }}
          marks={[{ value: markPositionToSet / 1000, label: <ArrowDropUpIcon /> }]}
        />
      </Box>

      <CardActions>
        {/* <Checkbox /> */}
        <IconButton aria-label="fullscreen" onClick={() => setFullscreenMode(true)}><FullscreenIcon /></IconButton>
        <IconButton aria-label="share" onClick={() => setShareMode(!shareMode) }><ShareIcon /></IconButton>
        {deleteButton}
      </CardActions>
      <Box ref={fullscreenRef} className='fullscreen' display={fullscreenMode ? 'block' : 'none'}>
        <Grid container>
          <Grid display="flex" size='grow' justifyContent="center" alignItems="center">
          {lightIcon}
          </Grid>
        </Grid>
      </Box>
      <ShareDialog
        url={url}
        open={shareMode}
        onClose={() => setShareMode(false)}
      />
    </Card>
  )
}
