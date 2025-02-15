import { State } from "../../app/domain/State"
import {
  CONDITIONAL_RIGHT_TEST_LIGHT_CONFIG,
  MAXED_OUT_TEST_LIGHT_CONFIG,
  TEST_LIGHT_CONFIG,
  TimeRange,
} from "../../app/domain/LightConfig"

const intersectionConfig = {
  cycleLength: 60_000,
  failure: {
    probability: 0,
    duration: 0,
  },
}

const lightConfig = TEST_LIGHT_CONFIG.withIntersectionConfig(intersectionConfig)

describe("LightConfig", () => {
  it("calculates phases", () => {
    expect(lightConfig.phases).toEqual([
      { state: State.RED, duration: 30_000 },
      { state: State.RED_YELLOW, duration: 2_000 },
      { state: State.GREEN, duration: 26_000 },
      { state: State.YELLOW, duration: 2_000 },
    ])
  })

  it("rounds offset updates to the nearest second", () => {
    expect(lightConfig.withOffset(500).offset).toEqual(1_000)
  })

  it("adjusts the green duration on red increase", () => {
    const modified = lightConfig.withStateDuration(State.RED, 31_000)

    expect(modified.phases).toContainEqual({
      state: State.RED,
      duration: 31_000,
    })
    expect(modified.phases).toContainEqual({
      state: State.GREEN,
      duration: 25_000,
    })
  })

  it("adjusts the green duration on red decrease", () => {
    const modified = lightConfig.withStateDuration(State.RED, 29_000)

    expect(modified.phases).toContainEqual({
      state: State.RED,
      duration: 29_000,
    })
    expect(modified.phases).toContainEqual({
      state: State.GREEN,
      duration: 27_000,
    })
  })

  it("adjusts the red duration up to the green limit", () => {
    const modified = lightConfig.withStateDuration(State.RED, 60_000)

    expect(modified.phases).toContainEqual({
      state: State.RED,
      duration: 56_000,
    })
    expect(modified.phases).toContainEqual({ state: State.GREEN, duration: 0 })
  })

  it("adjusts the red and green duration on cycle length decrease", () => {
    const modifiedLightConfig = lightConfig.withIntersectionConfig({
      ...intersectionConfig,
      cycleLength: 50_000,
    })

    expect(modifiedLightConfig.phases).toContainEqual({
      state: State.RED,
      duration: 25_000,
    })
    expect(modifiedLightConfig.phases).toContainEqual({
      state: State.GREEN,
      duration: 21_000,
    })
    expect(modifiedLightConfig.phases).toContainEqual({
      state: State.YELLOW,
      duration: 2_000,
    })
    expect(modifiedLightConfig.phases).toContainEqual({
      state: State.RED_YELLOW,
      duration: 2_000,
    })
  })

  it("adjusts the red and green duration on cycle length increase", () => {
    const modifiedLightConfig = lightConfig.withIntersectionConfig({
      ...intersectionConfig,
      cycleLength: 71_000,
    })

    expect(modifiedLightConfig.phases).toContainEqual({
      state: State.RED,
      duration: 35_000,
    })
    expect(modifiedLightConfig.phases).toContainEqual({
      state: State.GREEN,
      duration: 32_000,
    })
    expect(modifiedLightConfig.phases).toContainEqual({
      state: State.YELLOW,
      duration: 2_000,
    })
    expect(modifiedLightConfig.phases).toContainEqual({
      state: State.RED_YELLOW,
      duration: 2_000,
    })
  })

  it("does not adjust green below zero on cycle length decrease", () => {
    const adjustedLightConfig = lightConfig
      .withStateDuration(State.GREEN, 5_000)
      .withIntersectionConfig({ ...intersectionConfig, cycleLength: 10_000 })

    expect(adjustedLightConfig.phases).toContainEqual({
      state: State.RED,
      duration: 6_000,
    })
    expect(adjustedLightConfig.phases).toContainEqual({
      state: State.GREEN,
      duration: 0,
    })
    expect(adjustedLightConfig.phases).toContainEqual({
      state: State.YELLOW,
      duration: 2_000,
    })
    expect(adjustedLightConfig.phases).toContainEqual({
      state: State.RED_YELLOW,
      duration: 2_000,
    })
  })

  it("adjusts the offset so green start is kept at the same time frame after the duration change", () => {
    const modified = lightConfig.withStateDuration(State.GREEN, 27_000)

    const adjustedLightConfig = lightConfig
      .withStateDuration(State.GREEN, 27_000)
      .withIntersectionConfig({ ...intersectionConfig, cycleLength: 10_000 })

    expect(adjustedLightConfig.offset).toBe(1_000)
  })

  it("adjusts the red duration on time range increase right", () => {
    const modified = lightConfig.withStateTimeRange(
      State.RED,
      new TimeRange(0, 32_000, lightConfig.cycleLength()),
    )

    expect(modified.offset).toBe(0)
    expect(modified.phases).toContainEqual({
      state: State.RED,
      duration: 32_000,
    })
  })

  it("adjusts the green duration on time range increase right", () => {
    const modified = lightConfig.withStateTimeRange(
      State.GREEN,
      new TimeRange(32_000, 60_000, lightConfig.cycleLength()),
    )

    expect(modified.offset).toBe(2_000)
    expect(modified.phases).toContainEqual({
      state: State.GREEN,
      duration: 28_000,
    })
  })

  it("adjusts the green duration on time range increase right when green is wrapped", () => {
    const modified = lightConfig
      .withOffset(10_000)
      .withStateTimeRange(State.GREEN, new TimeRange(42_000, 10_000, lightConfig.cycleLength()))

    expect(modified.offset).toBe(12_000)
    expect(modified.phases).toContainEqual({
      state: State.GREEN,
      duration: 28_000,
    })
  })

  it("dragging maxed out red right thumb results in offset change", () => {
    const modified = MAXED_OUT_TEST_LIGHT_CONFIG.withIntersectionConfig(
      intersectionConfig,
    ).withStateTimeRange(State.RED, new TimeRange(9_000, 6_000, lightConfig.cycleLength()))

    expect(modified.offset).toBe(9_000)
    expect(modified.phases).toContainEqual({
      state: State.RED,
      duration: 56_000,
    })
  })

  it("dragging maxed out red left thumb results in offset change", () => {
    const modified = MAXED_OUT_TEST_LIGHT_CONFIG.withIntersectionConfig(
      intersectionConfig,
    ).withStateTimeRange(State.RED, new TimeRange(10_000, 7_000, lightConfig.cycleLength()))

    expect(modified.offset).toBe(11_000)
    expect(modified.phases).toContainEqual({
      state: State.RED,
      duration: 56_000,
    })
  })

  it("conditional right phases can be altered", () => {
    const modified = CONDITIONAL_RIGHT_TEST_LIGHT_CONFIG.withIntersectionConfig(
      intersectionConfig,
    ).withStateTimeRange(State.GREEN, new TimeRange(0, 15_000, lightConfig.cycleLength()))

    expect(modified.phases).toContainEqual({
      state: State.GREEN,
      duration: 15_000,
    })
  })
})
