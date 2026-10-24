import { State } from "./State"
import LightConfig, { Phase } from "./LightConfig"
import { negativeSafeMod } from "../utils"

const DEFAULT_OFFSET = 0

// out of order: blinking yellow, like a real car light, unless the light type says otherwise
const FAILURE_PHASES = [new Phase(State.YELLOW, 1000), new Phase(State.NONE, 1000)]

export default class TrafficLight {
  phases: Phase[]
  offset: number
  intervals: number[]
  cycleLength: number
  lightConfig: LightConfig

  constructor(lightConfig: LightConfig, failed: boolean) {
    this.lightConfig = lightConfig
    const { failureState } = lightConfig.preset
    this.phases = failed
      ? failureState
        ? [new Phase(failureState, 1000)]
        : FAILURE_PHASES
      : lightConfig.phases
    this.offset = failed ? 0 : lightConfig.offset || DEFAULT_OFFSET
    this.intervals = this.phases.map((phase) => phase.duration)
    this.cycleLength = this.intervals.reduce((sum, a) => sum + a, 0)
  }

  nextTransition(currentTimestamp: number) {
    const cycleStart =
      Math.floor((currentTimestamp - this.offset) / this.cycleLength) * this.cycleLength +
      this.offset
    let cycleTimestamp = cycleStart
    let phaseIdx = 0
    while (cycleTimestamp <= currentTimestamp) {
      cycleTimestamp += this.intervals[phaseIdx]
      phaseIdx = (phaseIdx + 1) % this.intervals.length
    }
    return {
      phaseIdx: phaseIdx,
      timestamp: cycleTimestamp,
    }
  }

  nextStateTimestamp(currentTimestamp: number) {
    return this.nextTransition(currentTimestamp).timestamp
  }

  currentPhase(currentTimestamp: number) {
    const phaseIdx = negativeSafeMod(
      this.nextTransition(currentTimestamp).phaseIdx - 1,
      this.intervals.length,
    )
    return this.phases[phaseIdx]
  }
}
