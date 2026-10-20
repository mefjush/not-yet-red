import LightConfig, { DEFAULT_LIGHT_CONFIG, Phase } from "../domain/LightConfig"
import { DEFAULT_INTERSECTION_CONFIG } from "../domain/IntersectionConfig"
import { lightConfigParser } from "../url"
import { PresetId, PRESETS } from "../domain/Preset"
import { State } from "../domain/State"

export type SceneLayout = "single" | "corridor" | "zebra" | "tJunction" | "manual"

export interface Scenario {
  name: string
  description: string
  setup: string
  layout: SceneLayout
  // one inner array per phone
  config: LightConfig[][]
}

const HALF_OFFSETTED = DEFAULT_LIGHT_CONFIG.withOffset(DEFAULT_INTERSECTION_CONFIG.cycleLength / 2)

const STATIC_PRESET_BASE = PRESETS[PresetId.FOUR_PHASE]

const staticLight = (state: State) =>
  DEFAULT_LIGHT_CONFIG.forceWithPhases([
    new Phase(state, 30_000),
    ...STATIC_PRESET_BASE.states.filter((s) => s != state).map((state) => new Phase(state, 0)),
  ])

// durations in seconds, in the order red, red-yellow, green, yellow; red starts at the offset
const timedLight = (
  offset: number,
  [red, redYellow, green, yellow]: number[],
  preset = PresetId.FOUR_PHASE,
) =>
  DEFAULT_LIGHT_CONFIG.withPreset(PRESETS[preset])
    .forceWithPhases(
      [State.RED, State.RED_YELLOW, State.GREEN, State.YELLOW].map(
        (state, idx) => new Phase(state, [red, redYellow, green, yellow][idx] * 1000),
      ),
    )
    .withOffset(offset * 1000)

export const SCENARIOS: Scenario[] = [
  {
    name: "Just one light",
    description: "The simplest start: make your toy cars stop and go.",
    setup: "Stand one phone next to a toy car track.",
    layout: "single",
    config: [[DEFAULT_LIGHT_CONFIG]],
  },
  {
    name: "Alternating traffic",
    description: "A road narrows to one lane, so each side takes turns.",
    setup: "Block half a hallway with a box. Put one phone at each end.",
    layout: "corridor",
    config: [[DEFAULT_LIGHT_CONFIG], [HALF_OFFSETTED]],
  },
  {
    name: "Zebra crossing",
    description: "Cars and pedestrians share the road. Who will wait?",
    setup: "One phone faces the 'cars', the other faces the 'pedestrians'.",
    layout: "zebra",
    config: [[DEFAULT_LIGHT_CONFIG], [HALF_OFFSETTED.withPreset(PRESETS[PresetId.PEDESTRIAN])]],
  },
  {
    name: "T-junction",
    description:
      "The main road goes first, then the side road. Cars turning left into the side road give way to oncoming traffic.",
    setup: "Find a T-shaped path in a park. Put a phone at each of the three roads.",
    layout: "tJunction",
    // one 30 s cycle: west green 2-12 s, east 2-18 s, side road right 16-28 s, side road left 22-28 s
    config: [
      [timedLight(14, [16, 2, 10, 2])],
      [timedLight(20, [10, 2, 16, 2])],
      [timedLight(0, [20, 2, 6, 2], PresetId.LEFT), timedLight(0, [14, 2, 12, 2], PresetId.RIGHT)],
    ],
  },
  {
    name: "Traffic controller",
    description: "You decide when the light changes.",
    setup: "Go fullscreen and swipe left or right to switch the light by hand.",
    layout: "manual",
    config: STATIC_PRESET_BASE.states.map((state) => [staticLight(state)]),
  },
]

export const scenarioUrl = (config: LightConfig[][]) =>
  "/intersection?lights=" +
  config.map((group) => lightConfigParser(DEFAULT_INTERSECTION_CONFIG).serialize(group)).join(",")
