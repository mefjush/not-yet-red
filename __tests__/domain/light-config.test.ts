import { State } from '../../app/domain/state'
import LightConfig, { TEST_LIGHT_SETTINGS, TimeRange } from '../../app/domain/light-config'

const crossingSettings = {
  cycleLength: 60_000,
  failure: {
    probability: 0,
    duration: 0
  }
}

const lightSettings = TEST_LIGHT_SETTINGS

describe('LightConfig', () => {
  it('calculates phases', () => {
    const lightConfig = new LightConfig(crossingSettings, lightSettings)

    expect(lightConfig.phases).toEqual([ 
        { state: State.RED, duration: 30_000 },
        { state: State.RED_YELLOW, duration: 2_000 },
        { state: State.GREEN, duration: 26_000 },
        { state: State.YELLOW, duration: 2_000 },
    ])
  })

  it('rounds offset updates to the nearest second', () => {
    const lightConfig = new LightConfig(crossingSettings, lightSettings)

    expect(lightConfig.withOffset(500)).toEqual({
      ...lightSettings,
      offset: 1_000
    })
  })

  it('adjusts the green duration on red increase', () => {
    const lightConfig = new LightConfig(crossingSettings, lightSettings)

    const modified = lightConfig.withStateDuration(State.RED, 31_000)
    
    expect(modified.phases).toContainEqual({ state: State.RED, duration: 31_000 })
    expect(modified.phases).toContainEqual({ state: State.GREEN, duration: 25_000 })
  })

  it('adjusts the green duration on red decrease', () => {
    const lightConfig = new LightConfig(crossingSettings, lightSettings)

    const modified = lightConfig.withStateDuration(State.RED, 29_000)
    
    expect(modified.phases).toContainEqual({ state: State.RED, duration: 29_000 })
    expect(modified.phases).toContainEqual({ state: State.GREEN, duration: 27_000 })
  })

  it('adjusts the red duration up to the green limit', () => {
    const lightConfig = new LightConfig(crossingSettings, lightSettings)

    const modified = lightConfig.withStateDuration(State.RED, 60_000)
    
    expect(modified.phases).toContainEqual({ state: State.RED, duration: 56_000 })
    expect(modified.phases).toContainEqual({ state: State.GREEN, duration: 0 })
  })

  it('adjusts the red and green duration on cycle length decrease', () => {
    const lightConfig = new LightConfig({ ...crossingSettings, cycleLength: 50_000 }, lightSettings)

    expect(lightConfig.phases).toContainEqual({ state: State.RED, duration: 25_000 })
    expect(lightConfig.phases).toContainEqual({ state: State.GREEN, duration: 21_000 })
    expect(lightConfig.phases).toContainEqual({ state: State.YELLOW, duration: 2_000 })
    expect(lightConfig.phases).toContainEqual({ state: State.RED_YELLOW, duration: 2_000 })
  })

  it('adjusts the red and green duration on cycle length increase', () => {
    const lightConfig = new LightConfig({ ...crossingSettings, cycleLength: 71_000 }, lightSettings)

    expect(lightConfig.phases).toContainEqual({ state: State.RED, duration: 35_000 })
    expect(lightConfig.phases).toContainEqual({ state: State.GREEN, duration: 32_000 })
    expect(lightConfig.phases).toContainEqual({ state: State.YELLOW, duration: 2_000 })
    expect(lightConfig.phases).toContainEqual({ state: State.RED_YELLOW, duration: 2_000 })
  })

  it('does not adjust green below zero on cycle length decrease', () => {
    const lightConfig = new LightConfig(crossingSettings, lightSettings)
    const modified = lightConfig.withStateDuration(State.GREEN, 5_000)

    const adjustedLightConfig = new LightConfig({ ...crossingSettings, cycleLength: 10_000 }, modified)

    expect(adjustedLightConfig.phases).toContainEqual({ state: State.RED, duration: 6_000 })
    expect(adjustedLightConfig.phases).toContainEqual({ state: State.GREEN, duration: 0 })
    expect(adjustedLightConfig.phases).toContainEqual({ state: State.YELLOW, duration: 2_000 })
    expect(adjustedLightConfig.phases).toContainEqual({ state: State.RED_YELLOW, duration: 2_000 })
  })

  it('adjusts the offset so green start is kept at the same time frame after the duration change', () => {
    const lightConfig = new LightConfig(crossingSettings, lightSettings)
    const modified = lightConfig.withStateDuration(State.GREEN, 27_000)

    const adjustedLightConfig = new LightConfig({ ...crossingSettings, cycleLength: 10_000 }, modified)

    expect(adjustedLightConfig.offset).toBe(1_000)
  })

  it('adjusts the red duration on time range increase right', () => {
    const lightConfig = new LightConfig(crossingSettings, lightSettings)
    const modified = lightConfig.withStateTimeRange(State.RED, new TimeRange(0, 32_000, lightConfig.cycleLength()))

    expect(modified.offset).toBe(0)
    expect(modified.phases).toContainEqual({ state: State.RED, duration: 32_000 })
  })

  it('adjusts the green duration on time range increase right', () => {
    const lightConfig = new LightConfig(crossingSettings, lightSettings)
    const modified = lightConfig.withStateTimeRange(State.GREEN, new TimeRange(32_000, 60_000, lightConfig.cycleLength()))

    expect(modified.offset).toBe(2_000)
    expect(modified.phases).toContainEqual({ state: State.GREEN, duration: 28_000 })
  })

  it('adjusts the green duration on time range increase right when green is wrapped', () => {
    const lightConfig = new LightConfig(crossingSettings, { ...lightSettings, offset: 10_000 })
    const modified = lightConfig.withStateTimeRange(State.GREEN, new TimeRange(42_000, 10_000, lightConfig.cycleLength()))

    expect(modified.offset).toBe(12_000)
    expect(modified.phases).toContainEqual({ state: State.GREEN, duration: 28_000 })
  })
})
