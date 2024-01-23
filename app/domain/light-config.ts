import { STATE } from "./state"
import CrossingSettings from "./crossing-settings"
import { Phase } from "./traffic-light"

export interface LightSettings {
  offset: number
  duration: {
    red: number
  }
}

export default class LightConfig {

  crossingSettings: CrossingSettings
  offset: number
  duration: { red: number }

  constructor(crossingSettings: CrossingSettings, lightSettings: LightSettings) {
    this.crossingSettings = crossingSettings
    this.offset = lightSettings.offset
    this.duration = lightSettings.duration
  }

  withRedDuration(red: number): LightSettings {
    return { offset: this.offset, duration: { red: red }}
  }

  withOffset(offset: number): LightSettings {
    return { offset: offset, duration: { red: this.duration.red }}
  }

  toLightSettings(): LightSettings {
    return { offset: this.offset, duration: { red: this.duration.red }}
  }

  cycleLength() {
    return this.crossingSettings.cycleLength
  }

  phases(): Phase[] {
    const DEFAULT_YELLOW_LENGTH = 2_000
    const timeLeft = this.cycleLength() - (2 * DEFAULT_YELLOW_LENGTH)
    const red = Math.max(Math.min(this.duration.red, timeLeft), 0)
    return [
      { state: STATE.RED, duration: red },
      { state: STATE.RED_YELLOW, duration: DEFAULT_YELLOW_LENGTH },
      { state: STATE.GREEN, duration: Math.max(timeLeft - red, 0) },
      { state: STATE.YELLOW, duration: DEFAULT_YELLOW_LENGTH }
    ]
  }
}
