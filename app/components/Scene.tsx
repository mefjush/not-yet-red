import { Box, Stack } from "@mui/material"
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk"
import SwipeIcon from "@mui/icons-material/Swipe"
import TrainIcon from "@mui/icons-material/Train"
import TramIcon from "@mui/icons-material/Tram"
import { SvgIconComponent } from "@mui/icons-material"
import LightConfig from "../domain/LightConfig"
import TrafficLight from "../domain/TrafficLight"
import LightHead from "./LightHead"
import { SceneLayout } from "./scenarios"

// all coordinates are in a 400 x 240 box
const W = 400
const H = 240

type Point = { x: number; y: number }
type Prop = Point & { icon: SvgIconComponent }

const ROAD = "var(--mui-palette-action-disabledBackground)"
const MARKING = "var(--mui-palette-background-paper)"

const horizontalRoad = (y: number, h: number, x = 0, w = W) => (
  <g key={`h${y}`}>
    <rect x={x} y={y} width={w} height={h} fill={ROAD} />
    <line
      x1={x}
      x2={x + w}
      y1={y + h / 2}
      y2={y + h / 2}
      stroke={MARKING}
      strokeWidth={2}
      strokeDasharray="10 8"
    />
  </g>
)

const LAYOUTS: Record<SceneLayout, { road: React.ReactNode; phones: Point[]; props: Prop[] }> = {
  // a looped toy car track; the phone stands inside the loop at the stop line
  single: {
    road: [
      <rect
        key="track"
        x={40}
        y={40}
        width={320}
        height={160}
        rx={80}
        fill="none"
        stroke={ROAD}
        strokeWidth={36}
      />,
      <rect
        key="track-line"
        x={40}
        y={40}
        width={320}
        height={160}
        rx={80}
        fill="none"
        stroke={MARKING}
        strokeWidth={2}
        strokeDasharray="10 8"
      />,
      <rect key="stop" x={250} y={182} width={4} height={36} fill={MARKING} />,
    ],
    phones: [{ x: 280, y: 135 }],
    props: [
      { icon: DirectionsCarIcon, x: 170, y: 200 },
      { icon: DirectionsCarIcon, x: 120, y: 40 },
    ],
  },
  // right-hand traffic: each light stands on its drivers' right; the box blocks the top lane
  corridor: {
    road: [
      horizontalRoad(90, 80),
      <rect
        key="box"
        x={180}
        y={90}
        width={40}
        height={40}
        rx={4}
        fill="#c8a165"
        stroke="#8d6e3f"
        strokeWidth={2}
      />,
    ],
    phones: [
      { x: 60, y: 205 },
      { x: 340, y: 50 },
    ],
    props: [
      { icon: DirectionsCarIcon, x: 90, y: 150 },
      { icon: DirectionsCarIcon, x: 310, y: 110 },
    ],
  },
  // the car light on the drivers' right; the pedestrian light across the road from the walker
  zebra: {
    road: [
      horizontalRoad(80, 80),
      ...Array.from({ length: 5 }, (_, i) => (
        <rect key={`z${i}`} x={190} y={84 + i * 16} width={40} height={8} fill={MARKING} />
      )),
    ],
    phones: [
      { x: 140, y: 200 },
      { x: 260, y: 45 },
    ],
    props: [
      { icon: DirectionsCarIcon, x: 90, y: 140 },
      { icon: DirectionsWalkIcon, x: 210, y: 195 },
    ],
  },
  tJunction: {
    road: [
      horizontalRoad(70, 60),
      <rect key="stem" x={170} y={130} width={60} height={110} fill={ROAD} />,
      <line
        key="stem-line"
        x1={200}
        x2={200}
        y1={130}
        y2={H}
        stroke={MARKING}
        strokeWidth={2}
        strokeDasharray="10 8"
      />,
    ],
    phones: [
      { x: 100, y: 180 },
      { x: 320, y: 48 },
      { x: 280, y: 195 },
    ],
    props: [
      { icon: DirectionsCarIcon, x: 40, y: 115 },
      { icon: DirectionsCarIcon, x: 360, y: 85 },
      { icon: DirectionsCarIcon, x: 215, y: 215 },
    ],
  },
  railway: {
    road: [
      horizontalRoad(95, 50),
      // sleepers, then the two rails running across the road
      ...Array.from({ length: 16 }, (_, i) => (
        <rect key={`s${i}`} x={186} y={i * 15 + 2} width={48} height={6} fill="#a1887f" />
      )),
      <rect key="rail-a" x={198} y={0} width={4} height={H} fill="#757575" />,
      <rect key="rail-b" x={218} y={0} width={4} height={H} fill="#757575" />,
    ],
    phones: [
      { x: 140, y: 195 },
      { x: 280, y: 48 },
    ],
    props: [
      { icon: DirectionsCarIcon, x: 80, y: 132 },
      { icon: DirectionsCarIcon, x: 340, y: 108 },
      { icon: TrainIcon, x: 210, y: 210 },
    ],
  },
  // tram rails set into the street, no sleepers; each light on its drivers' right
  tram: {
    road: [
      horizontalRoad(95, 50),
      <rect key="tram-bed" x={186} y={0} width={48} height={H} fill={ROAD} />,
      ...[194, 202, 218, 226].map((x) => (
        <rect key={`rail-${x}`} x={x} y={0} width={2} height={H} fill="#8d8d8d" />
      )),
    ],
    phones: [
      { x: 130, y: 195 },
      { x: 270, y: 195 },
      { x: 300, y: 48 },
    ],
    props: [
      { icon: DirectionsCarIcon, x: 70, y: 132 },
      { icon: DirectionsCarIcon, x: 345, y: 108 },
      { icon: TramIcon, x: 210, y: 210 },
    ],
  },
  // two lanes, both heading right into a tunnel; one phone over the entrance shows both lane signals
  tunnel: {
    road: [
      <rect key="road" x={0} y={70} width={W} height={100} fill={ROAD} />,
      <line
        key="lane-line"
        x1={0}
        x2={W}
        y1={120}
        y2={120}
        stroke={MARKING}
        strokeWidth={2}
        strokeDasharray="10 8"
      />,
      // the tunnel: a dark mouth with a concrete frame
      <rect key="tunnel" x={280} y={55} width={W - 280} height={130} fill="#9e9e9e" />,
      <rect key="mouth" x={290} y={70} width={W - 290} height={100} fill="#3a3a3a" />,
    ],
    phones: [{ x: 230, y: 120 }],
    props: [
      { icon: DirectionsCarIcon, x: 90, y: 95 },
      { icon: DirectionsCarIcon, x: 140, y: 145 },
    ],
  },
  manual: {
    road: [
      horizontalRoad(95, 50),
      <rect key="stop" x={250} y={120} width={4} height={25} fill={MARKING} />,
    ],
    phones: [{ x: 290, y: 195 }],
    props: [
      { icon: DirectionsCarIcon, x: 150, y: 132 },
      { icon: SwipeIcon, x: 345, y: 195 },
    ],
  },
}

const at = ({ x, y }: Point) => ({
  position: "absolute",
  left: `${(100 * x) / W}%`,
  top: `${(100 * y) / H}%`,
  transform: "translate(-50%, -50%)",
})

function MiniPhone({
  number,
  lights,
  timestamp,
}: {
  number: number
  lights: TrafficLight[]
  timestamp: number
}) {
  return (
    <Box
      sx={{
        position: "relative",
        border: "3px solid #222",
        borderRadius: "10px",
        bgcolor: "background.paper",
        px: 0.5,
        py: 0.75,
        boxShadow: 2,
      }}
    >
      <Stack direction="row" sx={{ alignItems: "flex-end" }}>
        {lights.map((light, idx) => (
          <LightHead
            key={idx}
            currentTimestamp={timestamp}
            light={light}
            lightConfig={light.lightConfig}
            maxHeight={56}
            maxWidth={
              light.lightConfig.preset.horizontal
                ? 60
                : light.lightConfig.preset.singleLens
                  ? 40
                  : 24
            }
          />
        ))}
      </Stack>
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: -10,
          left: -10,
          width: 20,
          height: 20,
          borderRadius: "50%",
          bgcolor: "primary.main",
          color: "primary.contrastText",
          fontSize: 11,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {number}
      </Box>
    </Box>
  )
}

// a bird's-eye sketch of where to put the phones, with their lights running live
export default function Scene({
  layout,
  config,
  timestamp,
}: {
  layout: SceneLayout
  config: LightConfig[][]
  timestamp: number
}) {
  const { road, phones, props } = LAYOUTS[layout]
  // the manual scene shows one phone that you swipe through
  const shownGroups = config.slice(0, phones.length)

  return (
    <Box
      role="img"
      className="scene"
      aria-label={`Sketch: ${shownGroups.length} phone${shownGroups.length > 1 ? "s" : ""} placed along the road`}
      sx={{
        position: "relative",
        aspectRatio: `${W} / ${H}`,
        bgcolor: "background.default",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ position: "absolute" }}>
        {road}
      </svg>
      {props.map(({ icon: Icon, ...point }, idx) => (
        <Icon key={idx} className="scene-item" sx={{ ...at(point), color: "text.secondary" }} />
      ))}
      {shownGroups.map((group, idx) => (
        <Box key={idx} className="scene-item" sx={at(phones[idx])}>
          <MiniPhone
            number={idx + 1}
            lights={group.map((lightConfig) => new TrafficLight(lightConfig, false))}
            timestamp={timestamp}
          />
        </Box>
      ))}
    </Box>
  )
}
