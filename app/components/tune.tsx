import { Box, Paper, Stack } from "@mui/material"
import { Phase } from "../domain/traffic-light"
import { negativeSafeMod } from "../utils"
import LightConfig from "../domain/light-config"

const radiousSize = 5

export default function Tune({lightConfig: lightSettings}: {lightConfig: LightConfig}) {

  const createSegment = function(phase: Phase, duration: number, idx: number, count: number) {

    const radious = idx == 0 ? `${radiousSize}px ${radiousSize}px 0 0` : idx == (count - 1) ? `0 0 ${radiousSize}px ${radiousSize}px` : "0 0 0 0"
    return (
      <Box key={idx} sx={{ height: 5 * duration / 1000, backgroundColor: phase.state.color, opacity: 0.8, borderRadius: radious }}></Box>
    )
  }

  let offset = lightSettings.offset
  let phases = lightSettings.phases()

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

  return (
    <Stack sx={{ my: 2 }}>
      {divs}
    </Stack>
  )
}
