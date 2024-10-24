import { State } from '../../app/domain/state'
import LightConfig, { DEFAULT_LIGHT_SETTINGS, TEST_LIGHT_SETTINGS } from '../../app/domain/light-config'

let crossingSettings = {
  cycleLength: 60_000,
  failure: {
    probability: 0,
    duration: 0
  }
}

const lightSettings = TEST_LIGHT_SETTINGS

describe('LightConfig', () => {
  it('calculates phases', () => {
    let lightConfig = new LightConfig(crossingSettings, lightSettings)

    expect(lightConfig.phases).toEqual([ 
        { state: State.RED, duration: 30_000 },
        { state: State.RED_YELLOW, duration: 2_000 },
        { state: State.GREEN, duration: 26_000 },
        { state: State.YELLOW, duration: 2_000 },
    ])
  })

  // it('caps the offset update at the cycle length', () => {
  //   let lightConfig = new LightConfig(crossingSettings, lightSettings)

  //   expect(lightConfig.withOffset(61_000)).toEqual({
  //     ...lightSettings,
  //     offset: 1_000
  //   })
  // })

  // it('sanitizes negative offset updates', () => {
  //   let lightConfig = new LightConfig(crossingSettings, lightSettings)

  //   expect(lightConfig.withOffset(-1_000)).toEqual({
  //     ...lightSettings,
  //     offset: 59_000
  //   })
  // })

  it('rounds offset updates to the nearest second', () => {
    let lightConfig = new LightConfig(crossingSettings, lightSettings)

    expect(lightConfig.withOffset(500)).toEqual({
      ...lightSettings,
      offset: 1_000
    })
  })

  it('adjusts the green duration on red increase', () => {
    let lightConfig = new LightConfig(crossingSettings, lightSettings)

    let modified = lightConfig.withStateDuration(State.RED, 31_000)
    
    expect(modified.phases).toContainEqual({ state: State.RED, duration: 31_000 })
    expect(modified.phases).toContainEqual({ state: State.GREEN, duration: 25_000 })
  })

  it('adjusts the green duration on red decrease', () => {
    let lightConfig = new LightConfig(crossingSettings, lightSettings)

    let modified = lightConfig.withStateDuration(State.RED, 29_000)
    
    expect(modified.phases).toContainEqual({ state: State.RED, duration: 29_000 })
    expect(modified.phases).toContainEqual({ state: State.GREEN, duration: 27_000 })
  })

  it('adjusts the red duration up to the green limit', () => {
    let lightConfig = new LightConfig(crossingSettings, lightSettings)

    let modified = lightConfig.withStateDuration(State.RED, 60_000)
    
    expect(modified.phases).toContainEqual({ state: State.RED, duration: 56_000 })
    expect(modified.phases).toContainEqual({ state: State.GREEN, duration: 0 })
  })

  it('adjusts the red and green duration on cycle length decrease', () => {
    let lightConfig = new LightConfig({ ...crossingSettings, cycleLength: 50_000 }, lightSettings)

    expect(lightConfig.phases).toContainEqual({ state: State.RED, duration: 25_000 })
    expect(lightConfig.phases).toContainEqual({ state: State.GREEN, duration: 21_000 })
    expect(lightConfig.phases).toContainEqual({ state: State.YELLOW, duration: 2_000 })
    expect(lightConfig.phases).toContainEqual({ state: State.RED_YELLOW, duration: 2_000 })
  })

  it('adjusts the red and green duration on cycle length increase', () => {
    let lightConfig = new LightConfig({ ...crossingSettings, cycleLength: 71_000 }, lightSettings)

    expect(lightConfig.phases).toContainEqual({ state: State.RED, duration: 35_000 })
    expect(lightConfig.phases).toContainEqual({ state: State.GREEN, duration: 32_000 })
    expect(lightConfig.phases).toContainEqual({ state: State.YELLOW, duration: 2_000 })
    expect(lightConfig.phases).toContainEqual({ state: State.RED_YELLOW, duration: 2_000 })
  })

  it('does not adjust green below zero on cycle length decrease', () => {
    let lightConfig = new LightConfig(crossingSettings, lightSettings)
    let modified = lightConfig.withStateDuration(State.GREEN, 5_000)

    let adjustedLightConfig = new LightConfig({ ...crossingSettings, cycleLength: 10_000 }, modified)

    expect(adjustedLightConfig.phases).toContainEqual({ state: State.RED, duration: 6_000 })
    expect(adjustedLightConfig.phases).toContainEqual({ state: State.GREEN, duration: 0 })
    expect(adjustedLightConfig.phases).toContainEqual({ state: State.YELLOW, duration: 2_000 })
    expect(adjustedLightConfig.phases).toContainEqual({ state: State.RED_YELLOW, duration: 2_000 })
  })
})
