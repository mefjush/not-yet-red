import { Box, Paper, Stack } from "@mui/material"
import { Phase } from "./trafficLight"
import { negativeSafeMod } from "./utils"
import LightConfig from "./lightConfig"

const radiousSize = 10

export default function Tune({lightConfig: lightSettings}: {lightConfig: LightConfig}) {

  const createSegment = function(segment: number, phase: Phase, length: number, count: number) {

    const radious = segment == 0 ? `${radiousSize}px ${radiousSize}px 0 0` : segment == count ? `0 0 ${radiousSize}px ${radiousSize}px` : "0 0 0 0"
    return (
      <Box key={segment} sx={{ height: 5 * length / 1000, backgroundColor: phase.state.color, opacity: 0.8, borderRadius: radious }}></Box>
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
  cells.push(createSegment(0, phases[phaseIdx], phases[phaseIdx].duration + offset, phases.length));

  for (let segment = 0; segment < phases.length; segment++) {
    let index = (phaseIdx + segment + 1) % phases.length
    let duration = (segment == phases.length - 1) ? (-offset) : phases[index].duration
    cells.push(createSegment(segment + 1, phases[index], duration, phases.length))
  }

  return (
    <Stack sx={{ my: 2 }}>
      {cells}
    </Stack>
  )
}
