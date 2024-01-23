import { STATE } from "./state"
import LightConfig from "./light-config"
import { negativeSafeMod } from "../utils"

const DEFAULT_OFFSET = 0

interface State {
  name: string
  file: string
  color: string
}

export interface Phase {
  state: State
  duration: number
}

const FAILURE_PHASES = [
  { state: STATE.YELLOW, duration: 1000 },
  { state: STATE.NONE, duration: 1000 }
]

export default class TrafficLight {
  phases: Phase[]
  offset: number
  intervals: number[]
  cycleLength: number

  constructor(lightSettings: LightConfig, failed: boolean) {
    this.phases = failed ? FAILURE_PHASES : lightSettings.phases()
    this.offset = failed ? 0 : lightSettings.offset || DEFAULT_OFFSET
    this.intervals = this.phases.map(phase => phase.duration)
    this.cycleLength = this.intervals.reduce((sum, a) => sum + a, 0)
  }

  nextTransition(currentTimestamp: number) {
    const cycleStart = Math.floor((currentTimestamp - this.offset) / this.cycleLength) * this.cycleLength + this.offset
    let cycleTimestamp = cycleStart
    let phaseIdx = 0
    while (cycleTimestamp <= currentTimestamp) {
      cycleTimestamp += this.intervals[phaseIdx]
      phaseIdx = (phaseIdx + 1) % this.intervals.length
    }
    return {
      phaseIdx: phaseIdx,
      timestamp: cycleTimestamp
    }
  }

  nextStateTimestamp(currentTimestamp: number) {
    return this.nextTransition(currentTimestamp).timestamp
  }

  currentPhase(currentTimestamp: number) {
    const phaseIdx = negativeSafeMod(this.nextTransition(currentTimestamp).phaseIdx - 1, this.intervals.length)
    return this.phases[phaseIdx]
  }
}
