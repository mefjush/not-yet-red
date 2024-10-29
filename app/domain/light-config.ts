import { SegmentColor, State, STATE_ATTRIBUTES, StateAttributes } from "./state"
import CrossingSettings from "./crossing-settings"
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import { SvgIconComponent } from "@mui/icons-material"
import BlurOnIcon from '@mui/icons-material/BlurOn'
import ManIcon from '@mui/icons-material/Man'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

const FOUR_STATE = [State.RED, State.RED_YELLOW, State.GREEN, State.YELLOW]
const THREE_STATE = [State.RED, State.GREEN, State.YELLOW]
const TWO_STATE = [State.RED, State.GREEN]

const THREE_COLOR: SegmentColor[] = ['tlRed', 'tlYellow', 'tlGreen']
const TWO_COLOR: SegmentColor[] = ['tlRed', 'tlGreen']

const DEFAULT_NEW_PHASE_DURATION = 2_000

export enum SymbolId {
  NONE = "NONE",
  PEDESTRIAN = "PEDESTRIAN",
  LEFT = "LEFT",
  RIGHT = "RIGHT"
}

export enum PresetId {
  FOUR_PHASE = "FOUR_PHASE",
  THREE_PHASE = "THREE_PHASE",
  PEDESTRIAN = "PEDESTRIAN",
  LEFT = "LEFT",
  RIGHT = "RIGHT"
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

export const SYMBOLS = Object.fromEntries([
  new Symbol(SymbolId.NONE, false, BlurOnIcon),
  new Symbol(SymbolId.PEDESTRIAN, false, ManIcon, DirectionsRunIcon),
  new Symbol(SymbolId.LEFT, true, ArrowBackIcon),
  new Symbol(SymbolId.RIGHT, true, ArrowForwardIcon)
].map(symbol => [symbol.symbolId, symbol]))

export const PRESETS = Object.fromEntries([
  new Preset(PresetId.FOUR_PHASE, "4-Phase", SymbolId.NONE, THREE_COLOR, FOUR_STATE),
  new Preset(PresetId.THREE_PHASE, "3-Phase", SymbolId.NONE, THREE_COLOR, THREE_STATE),
  new Preset(PresetId.PEDESTRIAN, "Pedestrian", SymbolId.PEDESTRIAN, TWO_COLOR, TWO_STATE),
  new Preset(PresetId.LEFT, "Left", SymbolId.LEFT, THREE_COLOR, FOUR_STATE),
  new Preset(PresetId.RIGHT, "Right", SymbolId.RIGHT, THREE_COLOR, FOUR_STATE),
].map(preset => [preset.presetId, preset]))

export class Phase {
  state: State
  duration: number

  constructor(state: State, duration: number) {
    this.state = state
    this.duration = duration
  }
  
  stateAttributes(): StateAttributes {
    return STATE_ATTRIBUTES[this.state]
  }
}

export interface LightSettings {
  offset: number
  phases: Phase[]
  presetId: PresetId
}

const sortByOrder = (a: Phase, b: Phase) => a.stateAttributes().order - b.stateAttributes().order
const sortByPriority = (a: Phase, b: Phase) => a.stateAttributes().priority - b.stateAttributes().priority

export default class LightConfig {

  crossingSettings: CrossingSettings
  offset: number
  phases: Phase[]
  preset: Preset

  constructor(crossingSettings: CrossingSettings, lightSettings: LightSettings) {
    this.crossingSettings = crossingSettings
    this.offset = lightSettings.offset
    this.phases = this.rescale(crossingSettings, lightSettings).phases
    this.preset = PRESETS[lightSettings.presetId]
  }

  withOffset(offset: number): LightSettings {
    // let positiveOffset = negativeSafeMod(offset, this.cycleLength() + 1000)
    const roundedOffset = Math.round((offset / 1000)) * 1000
    return { offset: roundedOffset, phases: this.phases, presetId: this.preset.presetId }
  }

  withPreset(presetId: PresetId): LightSettings {
    const preset = PRESETS[presetId]
    const newPhases = preset.states.map(state => this.phases.find(ph => ph.state == state) || new Phase(state, DEFAULT_NEW_PHASE_DURATION))
    return { offset: this.offset, phases: newPhases, presetId: presetId }
  }

  toLightSettings(): LightSettings {
    return { offset: this.offset, phases: this.phases, presetId: this.preset.presetId }
  }

  cycleLength() {
    return this.crossingSettings.cycleLength
  }

  isFixable(phase: Phase): boolean {
    return phase.stateAttributes().priority >= 3
  }

  roundSeconds(duration: number): number {
    return Math.round(duration / 1000) * 1000
  }

  rescale(crossingSettings: CrossingSettings, lightSettings: LightSettings): LightSettings {
    let phasesLength = lightSettings.phases.reduce((acc, phase) => acc + phase.duration, 0)
    let diff = crossingSettings.cycleLength - phasesLength

    if (Math.abs(diff) == 0) {
      return lightSettings
    }

    let fixableCount = lightSettings.phases.filter(this.isFixable).length
    let diffPerPhase = this.roundSeconds(diff / fixableCount)
    let diffRemainder = diff

    let fixedPhases = lightSettings.phases.toSorted((a, b) => b.duration - a.duration)
    
    let fixStrategies = [
      { precondition: this.isFixable, applicableDiff: () => diffPerPhase },
      { precondition: this.isFixable, applicableDiff: () => diffRemainder },
      { precondition: (p: Phase) => true, applicableDiff: () => diffRemainder }
    ]

    for (let i = 0; i < fixStrategies.length && Math.abs(diffRemainder) != 0; i++) {
      let strategy = fixStrategies[i]
      fixedPhases = fixedPhases.map((phase) => {
        if (!strategy.precondition(phase)) {
          return phase
        }
        let applicableDiff = Math.max(strategy.applicableDiff(), -phase.duration)
        diffRemainder -= applicableDiff
        return new Phase(phase.state, phase.duration + applicableDiff)
      })
    } 
    
    return { ...lightSettings, phases: fixedPhases.toSorted(sortByOrder) }
  }
    
  withStateDuration(state: State, newDuration: number): LightSettings {
    const calculateStateOffset = (phases: Phase[]) => {
      const stateIndex = this.phases.findIndex(p => p.state == state)
      return phases
        .filter((phase, idx) => idx < stateIndex)
        .reduce((acc, phase) => acc + phase.duration, 0)
    }

    let remainingPhases = this.phases.filter(p => p.state != state).toSorted(sortByPriority).reverse()
    let fixablePhases = remainingPhases.filter(this.isFixable)
    let unfixablePhases = remainingPhases.filter(p => !this.isFixable(p))

    let oldDuration = this.phases.find(p => p.state == state)?.duration || 0
    let diff = oldDuration - newDuration;

    let fixedRemaining = []
    
    for (let p of fixablePhases) {
      const durationBeforeFix = p.duration
      fixedRemaining.push(new Phase(p.state, Math.max(0, p.duration + diff)))
      if (diff < 0 && durationBeforeFix < Math.abs(diff)) {
        diff = diff + durationBeforeFix
      } else {
        diff = 0
      }
    }

    fixedRemaining.push(new Phase(state, newDuration + diff))

    const newPhases = fixedRemaining.concat(unfixablePhases).toSorted(sortByOrder)

    const offsetDiff = calculateStateOffset(this.phases) - calculateStateOffset(newPhases)

    return { offset: this.offset + offsetDiff, phases: newPhases, presetId: this.preset.presetId }
  }
}

export const DEFAULT_LIGHT_SETTINGS: LightSettings = {
  offset: 0,
  phases: [
    new Phase(State.RED, 16_000),
    new Phase(State.RED_YELLOW, 2_000),
    new Phase(State.GREEN, 10_000),
    new Phase(State.YELLOW, 2_000)
  ],
  presetId: PresetId.FOUR_PHASE
}

export const TEST_LIGHT_SETTINGS: LightSettings = {
  ...DEFAULT_LIGHT_SETTINGS,
  phases: [
    new Phase(State.RED, 30_000),
    new Phase(State.RED_YELLOW, 2_000),
    new Phase(State.GREEN, 26_000),
    new Phase(State.YELLOW, 2_000)
  ],
}