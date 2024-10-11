import { STATE } from "./state"
import CrossingSettings from "./crossing-settings"
import { Phase } from "./traffic-light"
import { negativeSafeMod } from "../utils"
import { duration } from "@mui/material"

// export interface PhaseConfig {
//   state: typeof STATE
//   defaultDuration: number | null
// }

export interface LightSettings {
  offset: number
  phases: Phase[]
}

export default class LightConfig {

  crossingSettings: CrossingSettings
  offset: number
  // duration: { red: number }
  phases: Phase[]

  constructor(crossingSettings: CrossingSettings, lightSettings: LightSettings) {
    this.crossingSettings = crossingSettings
    this.offset = lightSettings.offset
    this.phases = lightSettings.phases
  }

  // constructor(crossingSettings: CrossingSettings, phases: Phase[]) {
  //   this.crossingSettings = crossingSettings
  //   this.offset = lightSettings.offset
  //   this.duration = lightSettings.duration
  // }

  // withRedDuration(red: number): LightSettings {
  //   return { offset: this.offset, phases: this.phases}
  // }
  

  withOffset(offset: number): LightSettings {
    let positiveOffset = negativeSafeMod(offset, this.cycleLength())
    let roundedOffset = Math.round((positiveOffset / 1000)) * 1000
    return { offset: roundedOffset, phases: this.phases}
  }

  toLightSettings(): LightSettings {
    return { offset: this.offset, phases: this.phases}
  }

  cycleLength() {
    return this.crossingSettings.cycleLength
  }
    
  withPhaseDuration(oldPhase: Phase, newDuration: number): LightSettings {
    let remainingPhases = this.phases.filter(p => p.state != oldPhase.state).sort((a, b) => a.state.priority - b.state.priority).reverse();

    let diff = oldPhase.duration - newDuration;

    let fixedRemaining = []
    
    for (let p of remainingPhases) {
      let durationBeforeFix = p.duration
      fixedRemaining.push({ state: p.state, duration: Math.max(0, p.duration + diff) })
      if (diff < 0 && durationBeforeFix < Math.abs(diff)) {
        diff = diff + durationBeforeFix
      } else {
        diff = 0
      }
    }

    fixedRemaining.push({ state: oldPhase.state, duration: newDuration })

    return { offset: this.offset, phases: fixedRemaining.sort((a, b) => a.state.order - b.state.order)}
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