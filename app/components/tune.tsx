import { Box, Stack } from "@mui/material"
import { useState } from 'react'
import { Phase } from "../domain/traffic-light"
import { negativeSafeMod } from "../utils"
import LightConfig, {LightSettings} from "../domain/light-config"

const radiousSize = 5
const tuneHeight = 150

export default function Tune({lightConfig, onLightSettingsChange}: {lightConfig: LightConfig, onLightSettingsChange: (lightSettings: LightSettings) => void}) {

  const [touchMoveStartData, setTouchMoveStartData] = useState({ position: 0, offset: 0 })

  const createSegment = function(phase: Phase, duration: number, cycleLength: number, idx: number, count: number) {

    const radious = idx == 0 ? `${radiousSize}px ${radiousSize}px 0 0` : idx == (count - 1) ? `0 0 ${radiousSize}px ${radiousSize}px` : "0 0 0 0"
    return (
      <Box key={idx} sx={{ width: `${100 * duration / cycleLength}%`, backgroundColor: phase.state.color, opacity: 0.8, borderRadius: 0, height: "20px" }}></Box>
    )
  }

  const touchMove = (touches: React.TouchList) => {
    let moveDistance = touches[touches.length - 1].clientY - touchMoveStartData.position
    // console.log(touches)
    // console.log("Old offset " + touchMoveStartOffset)
    // console.log("Move distance " + moveDistance)
    
    let offsetPercentage = moveDistance / tuneHeight
    // console.log("Offset percentage " + offsetPercentage)

    let newOffset = touchMoveStartData.offset + (offsetPercentage * lightConfig.cycleLength())
    // console.log("New offset " + newOffset)
    
    onLightSettingsChange(lightConfig.withOffset(newOffset))
  }

  const touchStart = (e: React.TouchEvent) => {
    setTouchMoveStartData({
      position: e.changedTouches[0].clientY,
      offset: lightConfig.toLightSettings().offset
    })
  }

  let offset = lightConfig.offset
  let phases = lightConfig.phases()

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

  // https://github.com/petehunt/react-touch-lib/blob/90fb75f0f2bc92c4d9ac8b90806a10157aae3aa9/src/primitives/TouchableArea.js#L42-L49
  return (
    <Stack style={{ touchAction: "none" }} sx={{ my: 2 }} direction="row" onTouchStart={e => touchStart(e)} onTouchMove={e => touchMove(e.touches)}>
      {divs}
    </Stack>
  )
}
