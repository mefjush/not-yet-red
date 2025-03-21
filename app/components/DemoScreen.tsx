import Screen from "./Screen"
import LightGroups from "../domain/LightGroups"
import TrafficLight from "../domain/TrafficLight"
import { Box } from "@mui/material"

export default function DemoScreen({
  width,
  lightGroups,
  lights,
  currentTimestamp,
  fixed,
}: {
  width: number
  lightGroups: LightGroups
  lights: TrafficLight[]
  currentTimestamp: number
  fixed: number
}) {
  return (
    <Box
      sx={{
        padding: 3,
        backgroundImage: "url(/phone.png)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundPosition: "center center",
      }}
    >
      <Screen
        lightGroups={lightGroups}
        lights={lights}
        currentTimestamp={currentTimestamp}
        width={width}
        fixed={fixed}
      />
    </Box>
  )
}
