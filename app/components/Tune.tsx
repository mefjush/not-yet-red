import { Box, Stack } from "@mui/material"
import { negativeSafeMod } from "../utils"
import LightConfig, { Phase } from "../domain/LightConfig"

export default function Tune({ lightConfig }: { lightConfig: LightConfig }) {
  const createSegment = function (
    phase: Phase,
    duration: number,
    cycleLength: number,
    idx: number,
    count: number,
  ) {
    const radious =
      idx == 0 ? "3px 0 0 3px" : idx == count - 1 ? "0 3px 3px 0" : "0"

    return (
      <Box
        key={idx}
        bgcolor={`${phase.stateAttributes().color}.main`}
        sx={{
          width: `${(100 * duration) / cycleLength}%`,
          height: "6px",
          borderRadius: radious,
        }}
      />
    )
  }

  let offset = lightConfig.offset
  const phases = lightConfig.phases

  let phaseIdx = 0
  while (offset > 0) {
    phaseIdx = negativeSafeMod(phaseIdx - 1, phases.length)
    offset -= phases[phaseIdx].duration
  }

  const cells = []
  cells.push({
    phase: phases[phaseIdx],
    duration: phases[phaseIdx].duration + offset,
  })

  for (let segmentIdx = 0; segmentIdx < phases.length; segmentIdx++) {
    const index = (phaseIdx + segmentIdx + 1) % phases.length
    const duration =
      segmentIdx == phases.length - 1 ? -offset : phases[index].duration
    cells.push({ phase: phases[index], duration: duration })
  }

  const cellsFiltered = cells.filter((cell) => cell.duration > 0)

  const segments = cellsFiltered.map((cell, idx) =>
    createSegment(
      cell.phase,
      cell.duration,
      lightConfig.cycleLength(),
      idx,
      cellsFiltered.length,
    ),
  )

  // https://github.com/petehunt/react-touch-lib/blob/90fb75f0f2bc92c4d9ac8b90806a10157aae3aa9/src/primitives/TouchableArea.js#L42-L49
  return (
    <Stack style={{ touchAction: "none" }} sx={{ m: 0 }} direction="row">
      {segments}
    </Stack>
  )
}
