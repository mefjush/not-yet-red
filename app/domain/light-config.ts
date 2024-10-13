import { STATE } from "./state"
import CrossingSettings from "./crossing-settings"
import { Phase } from "./traffic-light"
import { negativeSafeMod } from "../utils"

export interface LightSettings {
  offset: number
  phases: Phase[]
}

export default class LightConfig {

  crossingSettings: CrossingSettings
  offset: number
  phases: Phase[]

  constructor(crossingSettings: CrossingSettings, lightSettings: LightSettings) {
    this.crossingSettings = crossingSettings
    this.offset = lightSettings.offset
    this.phases = this.rescale(crossingSettings, lightSettings).phases
  }

  withOffset(offset: number): LightSettings {
    let positiveOffset = negativeSafeMod(offset, this.cycleLength())
    let roundedOffset = Math.round((positiveOffset / 1000)) * 1000
    return { offset: roundedOffset, phases: this.phases }
  }

  toLightSettings(): LightSettings {
    return { offset: this.offset, phases: this.phases }
  }

  cycleLength() {
    return this.crossingSettings.cycleLength
  }

  isFixable(phase: Phase): boolean {
    return phase.state.priority >= 3
  }

  roundSeconds(duration: number): number {
    return Math.round(duration / 1000) * 1000
  }

  rescale(crossingSettings: CrossingSettings, lightSettings: LightSettings): LightSettings {
    let phasesLength = lightSettings.phases.reduce((acc, phase) => acc + phase.duration, 0)
    let diff = crossingSettings.cycleLength - phasesLength

    let fixableCount = lightSettings.phases.filter(this.isFixable).length
    let diffPerPhase = this.roundSeconds(diff / fixableCount)
    let diffRemainder = diff - (diffPerPhase * fixableCount)

    let fixedPhases = lightSettings.phases.map((phase, index) => {
      if (!this.isFixable(phase)) {
        return phase
      }
      let applicableDiff = diffPerPhase + ((index === 0) ? diffRemainder : 0)
      return { state: phase.state, duration: phase.duration + applicableDiff }
    })
    return { ...lightSettings, phases: fixedPhases }
  }
    
  withPhaseDuration(oldPhase: Phase, newDuration: number): LightSettings {
    let remainingPhases = this.phases.filter(p => p.state != oldPhase.state).sort((a, b) => a.state.priority - b.state.priority).reverse();
    let fixablePhases = remainingPhases.filter(this.isFixable)
    let unfixablePhases = remainingPhases.filter(p => !this.isFixable(p))

    let diff = oldPhase.duration - newDuration;

    let fixedRemaining = []
    
    for (let p of fixablePhases) {
      let durationBeforeFix = p.duration
      fixedRemaining.push({ state: p.state, duration: Math.max(0, p.duration + diff) })
      if (diff < 0 && durationBeforeFix < Math.abs(diff)) {
        diff = diff + durationBeforeFix
      } else {
        diff = 0
      }
    }

    fixedRemaining.push({ state: oldPhase.state, duration: newDuration + diff })

    return { offset: this.offset, phases: fixedRemaining.concat(unfixablePhases).sort((a, b) => a.state.order - b.state.order)}
  }
}

export const DEFAULT_LIGHT_SETTINGS = {
  offset: 0,
  phases: [
    { state: STATE.RED, duration: 30_000 },
    { state: STATE.RED_YELLOW, duration: 2_000 },
    { state: STATE.GREEN, duration: 26_000 },
    { state: STATE.YELLOW, duration: 2_000 }
  ]
}
