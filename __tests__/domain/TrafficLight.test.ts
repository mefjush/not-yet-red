import { describe, expect, test, it } from "vitest"
import { State } from "../../app/domain/State"
import { DEFAULT_LIGHT_CONFIG, TEST_LIGHT_CONFIG } from "../../app/domain/LightConfig"
import { PRESETS, PresetId } from "../../app/domain/Preset"
import TrafficLight from "../../app/domain/TrafficLight"

const TEST_INTERSECTION_SETTINGS = {
  cycleLength: 60_000,
  failure: {
    probability: 0,
    duration: 0,
  },
}

const LIGHT_SETTINGS = TEST_LIGHT_CONFIG.withIntersectionConfig(TEST_INTERSECTION_SETTINGS)

describe("TrafficLight", () => {
  it("calculates next transition when in the middle of first phase", () => {
    const trafficLight = new TrafficLight(LIGHT_SETTINGS, false)

    expect(trafficLight.nextTransition(10_000)).toEqual({
      phaseIdx: 1,
      timestamp: 30000,
    })
  })

  it("calculates next transition when at the very beginning of the first phase", () => {
    const trafficLight = new TrafficLight(LIGHT_SETTINGS, false)

    expect(trafficLight.nextTransition(60_000)).toEqual({
      phaseIdx: 1,
      timestamp: 90_000,
    })
  })

  it("calculates next transition when in the middle of last phase", () => {
    const trafficLight = new TrafficLight(LIGHT_SETTINGS, false)

    expect(trafficLight.nextTransition(59_000)).toEqual({
      phaseIdx: 0,
      timestamp: 60_000,
    })
  })

  it("calculates current phase when in the middle of the current phase", () => {
    const trafficLight = new TrafficLight(LIGHT_SETTINGS, false)

    expect(trafficLight.currentPhase(10_000).state).toBe(State.RED)
  })

  it("calculates current phase when at the very beginning of the current phase", () => {
    const trafficLight = new TrafficLight(LIGHT_SETTINGS, false)

    expect(trafficLight.currentPhase(60_000).state).toBe(State.RED)
  })
})

describe("TrafficLight out of order", () => {
  const statesOver = (light: TrafficLight) =>
    new Set(Array.from({ length: 20 }, (_, i) => light.currentPhase(i * 250).state))

  it("blinks yellow on a car light", () => {
    const light = new TrafficLight(DEFAULT_LIGHT_CONFIG, true)

    expect(statesOver(light)).toEqual(new Set([State.YELLOW, State.NONE]))
  })

  it("goes dark on a lane signal instead of showing 'leave the lane'", () => {
    const lane = DEFAULT_LIGHT_CONFIG.withPreset(PRESETS[PresetId.LANE_CONTROL])
    const light = new TrafficLight(lane, true)

    expect(statesOver(light)).toEqual(new Set([State.NONE]))
  })
})
