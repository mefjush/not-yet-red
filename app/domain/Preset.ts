import { SvgIconComponent } from "@mui/icons-material"
import { State, STATE_ATTRIBUTES } from "./State"
import { SegmentColor } from "./State"
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun"
import BlurOnIcon from "@mui/icons-material/BlurOn"
import ManIcon from "@mui/icons-material/Man"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import UTurnLeftIcon from "@mui/icons-material/UTurnLeft"
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike"
import { createSvgIcon } from "@mui/material/utils"
import { createElement } from "react"

// white bars of a tram signal: horizontal means stop, vertical means go
const HorizontalBarIcon = createSvgIcon(
  createElement("path", { d: "M2 9.5h20v5H2z" }),
  "HorizontalBar",
)
const VerticalBarIcon = createSvgIcon(
  createElement("path", { d: "M9.5 2h5v20h-5z" }),
  "VerticalBar",
)

const FOUR_STATE = [State.RED, State.RED_YELLOW, State.GREEN, State.YELLOW]
const THREE_STATE = [State.RED, State.GREEN, State.YELLOW]
const TWO_STATE = [State.RED, State.GREEN]
const PEDESTRIAN_THREE_STATE = [State.RED, State.GREEN, State.GREEN_FLASHING]
const RAILWAY_STATE = [State.NONE, State.RED_ALTERNATING]
const WARNING_STATE = [State.YELLOW_FLASHING]

const THREE_COLOR: SegmentColor[] = ["tlRed", "tlYellow", "tlGreen"]
const TWO_COLOR: SegmentColor[] = ["tlRed", "tlGreen"]

export enum SymbolId {
  NONE = "NONE",
  PEDESTRIAN = "PEDESTRIAN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  STRAIGHT = "STRAIGHT",
  UTURN = "UTURN",
  BICYCLE = "BICYCLE",
  TRAM = "TRAM",
}

export class Symbol {
  symbolId: SymbolId
  invertable: boolean
  icon: SvgIconComponent
  iconGreen?: SvgIconComponent
  // every lamp shows its symbol in white, whatever it means (tram signals)
  white: boolean

  constructor(
    symbolId: SymbolId,
    invertable: boolean,
    icon: SvgIconComponent,
    iconGreen?: SvgIconComponent,
    white = false,
  ) {
    this.symbolId = symbolId
    this.icon = icon
    this.iconGreen = iconGreen
    this.invertable = invertable
    this.white = white
  }

  getIcon(segmentColor: SegmentColor): SvgIconComponent {
    return segmentColor == "tlGreen" && this.iconGreen ? this.iconGreen : this.icon
  }

  isInverted(segmentColor: SegmentColor): boolean {
    return this.invertable && segmentColor != "tlGreen"
  }
}

export const SYMBOLS = Object.fromEntries(
  [
    new Symbol(SymbolId.NONE, false, BlurOnIcon),
    new Symbol(SymbolId.PEDESTRIAN, false, ManIcon, DirectionsRunIcon),
    new Symbol(SymbolId.LEFT, true, ArrowBackIcon),
    new Symbol(SymbolId.RIGHT, true, ArrowForwardIcon),
    new Symbol(SymbolId.STRAIGHT, true, ArrowUpwardIcon),
    new Symbol(SymbolId.UTURN, true, UTurnLeftIcon),
    new Symbol(SymbolId.BICYCLE, false, DirectionsBikeIcon),
    // the "red" lamp is the stop bar, the "green" lamp the go bar
    new Symbol(SymbolId.TRAM, false, HorizontalBarIcon, VerticalBarIcon, true),
  ].map((symbol) => [symbol.symbolId, symbol]),
)

export class Preset {
  presetId: PresetId
  name: string
  symbolId: SymbolId
  colors: SegmentColor[]
  states: State[]
  // lamps side by side instead of stacked
  horizontal: boolean
  // what this light calls a phase, where it differs from the usual name (e.g. a tram's bars)
  stateNames: Partial<Record<State, string>>

  constructor(
    preset: PresetId,
    name: string,
    symbol: SymbolId,
    colors: SegmentColor[],
    states: State[],
    options: { horizontal?: boolean; stateNames?: Partial<Record<State, string>> } = {},
  ) {
    this.presetId = preset
    this.name = name
    this.symbolId = symbol
    this.colors = colors
    this.states = states
    this.horizontal = options.horizontal ?? false
    this.stateNames = options.stateNames ?? {}
  }

  phaseName(state: State): string {
    return this.stateNames[state] ?? STATE_ATTRIBUTES[state].name
  }
}

export enum PresetId {
  FOUR_PHASE = "FOUR_PHASE",
  THREE_PHASE = "THREE_PHASE",
  PEDESTRIAN = "PEDESTRIAN",
  PEDESTRIAN_FLASHING = "PEDESTRIAN_FLASHING",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  CONDITIONAL_RIGHT = "CONDITIONAL_RIGHT",
  STRAIGHT = "STRAIGHT",
  UTURN = "UTURN",
  RAILWAY = "RAILWAY",
  BICYCLE = "BICYCLE",
  FLASHING_YELLOW = "FLASHING_YELLOW",
  TRAM = "TRAM",
}

export const PRESETS = Object.fromEntries(
  [
    new Preset(PresetId.FOUR_PHASE, "4-Phase", SymbolId.NONE, THREE_COLOR, FOUR_STATE),
    new Preset(PresetId.THREE_PHASE, "3-Phase", SymbolId.NONE, THREE_COLOR, THREE_STATE),
    new Preset(
      PresetId.PEDESTRIAN,
      "Pedestrian (2-phase)",
      SymbolId.PEDESTRIAN,
      TWO_COLOR,
      TWO_STATE,
    ),
    new Preset(
      PresetId.PEDESTRIAN_FLASHING,
      "Pedestrian (3-phase)",
      SymbolId.PEDESTRIAN,
      TWO_COLOR,
      PEDESTRIAN_THREE_STATE,
    ),
    new Preset(PresetId.LEFT, "Left", SymbolId.LEFT, THREE_COLOR, FOUR_STATE),
    new Preset(PresetId.RIGHT, "Right", SymbolId.RIGHT, THREE_COLOR, FOUR_STATE),
    new Preset(PresetId.STRAIGHT, "Straight", SymbolId.STRAIGHT, THREE_COLOR, FOUR_STATE),
    new Preset(PresetId.UTURN, "U-Turn", SymbolId.UTURN, THREE_COLOR, FOUR_STATE),
    new Preset(
      PresetId.CONDITIONAL_RIGHT,
      "Conditional Right",
      SymbolId.RIGHT,
      ["tlGreen"],
      [State.GREEN, State.NONE],
    ),
    new Preset(
      PresetId.RAILWAY,
      "Railway crossing",
      SymbolId.NONE,
      ["tlRed", "tlRed"],
      RAILWAY_STATE,
      { horizontal: true },
    ),
    // runs like a car light, as for cyclists riding in a traffic lane
    new Preset(PresetId.BICYCLE, "Bicycle", SymbolId.BICYCLE, THREE_COLOR, FOUR_STATE),
    // warns of danger: take care and give way by the usual rules
    new Preset(
      PresetId.FLASHING_YELLOW,
      "Flashing yellow (warning)",
      SymbolId.NONE,
      ["tlYellow"],
      WARNING_STATE,
    ),
    // Polish ST tram signal: horizontal bar stop, vertical bar go, flashing vertical bar stop soon
    new Preset(PresetId.TRAM, "Tram", SymbolId.TRAM, TWO_COLOR, PEDESTRIAN_THREE_STATE, {
      stateNames: {
        [State.RED]: "Stop (—)",
        [State.GREEN]: "Go (|)",
        [State.GREEN_FLASHING]: "Stop soon (flashing |)",
      },
    }),
  ].map((preset) => [preset.presetId, preset]),
)
