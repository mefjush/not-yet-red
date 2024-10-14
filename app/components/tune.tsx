import { Box, Button, Stack } from "@mui/material"
import { useState } from 'react'
import { Phase } from "../domain/traffic-light"
import { negativeSafeMod } from "../utils"
import LightConfig, {LightSettings} from "../domain/light-config"

const tuneHeight = 150

export default function Tune({lightConfig, onLightSettingsChange}: {lightConfig: LightConfig, onLightSettingsChange: (lightSettings: LightSettings) => void}) {

  const [touchMoveStartData, setTouchMoveStartData] = useState({ position: 0, offset: 0 })

  const createSegment = function(phase: Phase, duration: number, cycleLength: number, idx: number, count: number) {
    return (
      <Box key={idx} sx={{ width: `${100 * duration / cycleLength}%`, backgroundColor: phase.state.color, opacity: 0.8, height: "20px" }}></Box>
    )
  }

  const createSegment2 = function(inc: boolean, phase: Phase, duration: number, cycleLength: number, idx: number, count: number) {
    let step = inc ? 1000 : -1000
    let margin = idx % 2 == 0 ? "0" : "100px"
    console.log(`margin ${margin}`)
    return (
      <Box key={idx} sx={{ width: `${100 * duration / cycleLength}%` }} display="flex" justifyContent="center" alignItems="center">
        <Button sx={{ marginTop: margin }}  variant="outlined" onClick={e => onLightSettingsChange(lightConfig.withPhaseDuration(phase, phase.duration + step))}>{inc ? "+" : "-"}</Button>
      </Box>
    )
  }

  const touchMove = (touches: React.TouchList) => {
    let touch = touches[touches.length - 1]
    move(touch.clientX, tuneHeight)
  }

  const drag = (e: React.DragEvent) => {
    console.log(e.currentTarget.clientWidth)
    move(e.clientX, e.currentTarget.clientWidth)
  }

  const move = (clientX: number, clientWidth: number) => {
    let moveDistance = clientX - touchMoveStartData.position
    
    let offsetPercentage = moveDistance / clientWidth

    let newOffset = touchMoveStartData.offset + (offsetPercentage * lightConfig.cycleLength())
    
    onLightSettingsChange(lightConfig.withOffset(newOffset))
  }

  const touchStart = (e: React.TouchEvent) => {
    moveStart(e.changedTouches[0].clientX)
  }

  const dragStart = (e: React.DragEvent) => {
    moveStart(e.clientX)
  }

  const moveStart = (clientX: number) => {
    setTouchMoveStartData({
      position: clientX,
      offset: lightConfig.toLightSettings().offset
    })
  }

  let offset = lightConfig.offset
  let phases = lightConfig.phases

  let phaseIdx = 0
  while (offset > 0) {
    phaseIdx = negativeSafeMod(phaseIdx - 1, phases.length)
    offset -= phases[phaseIdx].duration
  }

  let cells = []
  cells.push({ phase: phases[phaseIdx], duration: phases[phaseIdx].duration + offset })

  for (let segment = 0; segment < phases.length; segment++) {
    let index = (phaseIdx + segment + 1) % phases.length
    let duration = (segment == phases.length - 1) ? (-offset) : phases[index].duration
    cells.push({ phase: phases[index], duration: duration })
  }

  const cellsFiltered = cells
    .filter((cell) => cell.duration > 0)

  const divs = cellsFiltered.map((cell, idx) => createSegment(cell.phase, cell.duration, lightConfig.cycleLength(), idx, cellsFiltered.length))
  const pluses = cellsFiltered.map((cell, idx) => createSegment2(true, cell.phase, cell.duration, lightConfig.cycleLength(), idx, cellsFiltered.length))
  const minuses = cellsFiltered.map((cell, idx) => createSegment2(false, cell.phase, cell.duration, lightConfig.cycleLength(), idx, cellsFiltered.length))

  // https://github.com/petehunt/react-touch-lib/blob/90fb75f0f2bc92c4d9ac8b90806a10157aae3aa9/src/primitives/TouchableArea.js#L42-L49
  return (
    <>
      {/* <Stack style={{ touchAction: "none" }} sx={{ m: 1 }} direction="row">
        {pluses}
      </Stack> */}
      <Stack style={{ touchAction: "none" }} sx={{ m: 0 }} direction="row" onDragStart={e => dragStart(e)} onTouchStart={e => touchStart(e)} onTouchMove={e => touchMove(e.touches)} onDrag={e => drag(e)} onDragEnd={e => console.log(e)}>
        {divs}
      </Stack>
      {/* <Stack style={{ touchAction: "none" }} sx={{ m: 1 }} direction="row">
        {minuses}
      </Stack> */}
    </>
  )
}
