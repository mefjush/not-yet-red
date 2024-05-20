import { Box, Stack } from "@mui/material"
import { useState } from 'react'
import { Phase } from "../domain/traffic-light"
import { negativeSafeMod } from "../utils"
import LightConfig, {LightSettings} from "../domain/light-config"

const radiousSize = 5

export default function Tune({lightConfig, onLightSettingsChange}: {lightConfig: LightConfig, onLightSettingsChange: (lightSettings: LightSettings) => void}) {

  const [touchMoveStartPosition, setTouchMoveStartPosition] = useState(0)
  const [touchMoveStartOffset, setTouchMoveStartOffset] = useState(0)

  const createSegment = function(phase: Phase, duration: number, idx: number, count: number) {

    const radious = idx == 0 ? `${radiousSize}px ${radiousSize}px 0 0` : idx == (count - 1) ? `0 0 ${radiousSize}px ${radiousSize}px` : "0 0 0 0"
    return (
      <Box key={idx} sx={{ height: 5 * duration / 1000, backgroundColor: phase.state.color, opacity: 0.8, borderRadius: radious }}></Box>
    )
  }

  const touchMove = (touches: React.TouchList) => {
    let moveDistance = touches[touches.length - 1].clientY - touchMoveStartPosition
    console.log(touches)
    // let oldSettings = lightConfig.toLightSettings()
    // console.log("Old offset " + oldSettings.offset)
    let newOffset = touchMoveStartOffset + (Math.round(moveDistance) * 200)
    console.log("Move distance " + moveDistance)
    console.log("New offset " + newOffset)
    onLightSettingsChange(lightConfig.withOffset(newOffset))
  }

  const touchStart = (e: React.TouchEvent) => {
    setTouchMoveStartOffset(lightConfig.toLightSettings().offset)
    setTouchMoveStartPosition(e.changedTouches[0].clientY)
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

  const divs = cellsFiltered.map((cell, idx) => createSegment(cell.phase, cell.duration, idx, cellsFiltered.length))

  // https://github.com/petehunt/react-touch-lib/blob/90fb75f0f2bc92c4d9ac8b90806a10157aae3aa9/src/primitives/TouchableArea.js#L42-L49
  return (
    <Stack style={{ touchAction: "none" }} sx={{ my: 2 }} onTouchStart={e => touchStart(e)} onTouchMove={e => touchMove(e.touches)}>
      {divs}
    </Stack>
  )
}
