import { Box, Stack } from "@mui/material"
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk"
import SwipeIcon from "@mui/icons-material/Swipe"
import TrainIcon from "@mui/icons-material/Train"
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
  single: {
    road: [
      horizontalRoad(95, 50),
      <rect key="stop" x={250} y={120} width={4} height={25} fill={MARKING} />,
    ],
    phones: [{ x: 290, y: 195 }],
    props: [{ icon: DirectionsCarIcon, x: 150, y: 132 }],
  },
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
      { x: 60, y: 50 },
      { x: 340, y: 205 },
    ],
    props: [
      { icon: DirectionsCarIcon, x: 90, y: 150 },
      { icon: DirectionsCarIcon, x: 310, y: 150 },
    ],
  },
  zebra: {
    road: [
      horizontalRoad(80, 80),
      ...Array.from({ length: 5 }, (_, i) => (
        <rect key={`z${i}`} x={190} y={84 + i * 16} width={40} height={8} fill={MARKING} />
      )),
    ],
    phones: [
      { x: 140, y: 45 },
      { x: 260, y: 200 },
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
            maxWidth={light.lightConfig.preset.horizontal ? 60 : 24}
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
