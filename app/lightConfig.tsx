import { STATE } from "./STATE"
import CrossingSettings from "./crossingSettings"
import { Phase } from "./trafficLight"

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
    const cycleLength = this.crossingSettings.cycleLength
    const DEFAULT_YELLOW_LENGTH = 2000
    const timeLeft = cycleLength - 2 * DEFAULT_YELLOW_LENGTH
    const red = Math.min(this.duration.red, timeLeft) || Math.floor(timeLeft / 2000) * 1000
    return [
      { state: STATE.RED, duration: red },
      { state: STATE.RED_YELLOW, duration: DEFAULT_YELLOW_LENGTH },
      { state: STATE.GREEN, duration: timeLeft - red },
      { state: STATE.YELLOW, duration: DEFAULT_YELLOW_LENGTH }
    ]
  }
}
