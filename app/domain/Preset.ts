import { SvgIconComponent } from "@mui/icons-material"
import { State } from "./State"
import { SegmentColor } from "./State"
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import BlurOnIcon from '@mui/icons-material/BlurOn'
import ManIcon from '@mui/icons-material/Man'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import UTurnLeftIcon from '@mui/icons-material/UTurnLeft'

const FOUR_STATE = [State.RED, State.RED_YELLOW, State.GREEN, State.YELLOW]
const THREE_STATE = [State.RED, State.GREEN, State.YELLOW]
const TWO_STATE = [State.RED, State.GREEN]

const THREE_COLOR: SegmentColor[] = ['tlRed', 'tlYellow', 'tlGreen']
const TWO_COLOR: SegmentColor[] = ['tlRed', 'tlGreen']

export enum SymbolId {
  NONE = "NONE",
  PEDESTRIAN = "PEDESTRIAN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  STRAIGHT = "STRAIGHT",
  UTURN = "UTURN"
}

export class Symbol {
  symbolId: SymbolId
  invertable: boolean
  icon: SvgIconComponent
  iconGreen?: SvgIconComponent

  constructor(symbolId: SymbolId, invertable: boolean, icon: SvgIconComponent, iconGreen?: SvgIconComponent) {
    this.symbolId = symbolId
    this.icon = icon
    this.iconGreen = iconGreen
    this.invertable = invertable
  }
  
  getIcon(segmentColor: SegmentColor): SvgIconComponent {
    return segmentColor == 'tlGreen' && this.iconGreen ? this.iconGreen : this.icon
  }

  isInverted(segmentColor: SegmentColor): boolean {
    return this.invertable && segmentColor != 'tlGreen'
  }
}

export const SYMBOLS = Object.fromEntries([
  new Symbol(SymbolId.NONE, false, BlurOnIcon),
  new Symbol(SymbolId.PEDESTRIAN, false, ManIcon, DirectionsRunIcon),
  new Symbol(SymbolId.LEFT, true, ArrowBackIcon),
  new Symbol(SymbolId.RIGHT, true, ArrowForwardIcon),
  new Symbol(SymbolId.STRAIGHT, true, ArrowUpwardIcon),
  new Symbol(SymbolId.UTURN, true, UTurnLeftIcon)
].map(symbol => [symbol.symbolId, symbol]))

export class Preset {
  presetId: PresetId
  name: string
  symbolId: SymbolId
  colors: SegmentColor[]
  states: State[]

  constructor(preset: PresetId, name: string, symbol: SymbolId, colors: SegmentColor[], states: State[]) {
    this.presetId = preset
    this.name = name
    this.symbolId = symbol
    this.colors = colors
    this.states = states
  }
}

export enum PresetId {
  FOUR_PHASE = "FOUR_PHASE",
  THREE_PHASE = "THREE_PHASE",
  PEDESTRIAN = "PEDESTRIAN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  CONDITIONAL_RIGHT = "CONDITIONAL_RIGHT",
  STRAIGHT = "STRAIGHT",
  UTURN = "UTURN"
}

export const PRESETS = Object.fromEntries([
  new Preset(PresetId.FOUR_PHASE, "4-Phase", SymbolId.NONE, THREE_COLOR, FOUR_STATE),
  new Preset(PresetId.THREE_PHASE, "3-Phase", SymbolId.NONE, THREE_COLOR, THREE_STATE),
  new Preset(PresetId.PEDESTRIAN, "Pedestrian", SymbolId.PEDESTRIAN, TWO_COLOR, TWO_STATE),
  new Preset(PresetId.LEFT, "Left", SymbolId.LEFT, THREE_COLOR, FOUR_STATE),
  new Preset(PresetId.RIGHT, "Right", SymbolId.RIGHT, THREE_COLOR, FOUR_STATE),
  new Preset(PresetId.STRAIGHT, "Straight", SymbolId.STRAIGHT, THREE_COLOR, FOUR_STATE),
  new Preset(PresetId.UTURN, "U-Turn", SymbolId.UTURN, THREE_COLOR, FOUR_STATE),
  new Preset(PresetId.CONDITIONAL_RIGHT, "Conditional Right", SymbolId.RIGHT, ['tlGreen'], [State.GREEN, State.NONE]),
].map(preset => [preset.presetId, preset]))
