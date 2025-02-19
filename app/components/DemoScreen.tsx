import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone"
import Screen from "./Screen"
import LightGroups from "../domain/LightGroups"
import TrafficLight from "../domain/TrafficLight"

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
    <div style={{ position: "relative", width: `${width}px`, height: `${width}px` }}>
      <Screen
        lightGroups={lightGroups}
        lights={lights}
        currentTimestamp={currentTimestamp}
        width={0.5 * width}
        fixed={fixed}
      />
      <PhoneIphoneIcon
        sx={{ width: `${width}px`, height: `${width}px` }}
        style={{ position: "absolute", top: `${0.06 * width}`, left: `${0.02 * width}` }}
      />
    </div>
  )
}
