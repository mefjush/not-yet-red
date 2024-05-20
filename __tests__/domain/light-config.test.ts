import { STATE } from '../../app/domain/state'
import LightConfig from '../../app/domain/light-config'

let crossingSettings = {
  cycleLength: 60_000,
  failure: {
    probability: 0,
    duration: 0
  }
}

let lightSettings = {
  offset: 0,
  duration: {
    red: 30_000
  }
}

describe('LightConfig', () => {
  it('calculates phases', () => {
    let lightConfig = new LightConfig(crossingSettings, lightSettings)

    expect(lightConfig.phases()).toEqual([ 
        { state: STATE.RED, duration: 30_000 },
        { state: STATE.RED_YELLOW, duration: 2_000 },
        { state: STATE.GREEN, duration: 26_000 },
        { state: STATE.YELLOW, duration: 2_000 },
    ])
  })

  it('caps the offset update at the cycle length', () => {
    let lightConfig = new LightConfig(crossingSettings, lightSettings)

    expect(lightConfig.withOffset(61_000)).toEqual({
      ...lightSettings,
      offset: 1_000
    })
  })

  it('sanitizes negative offset updates', () => {
    let lightConfig = new LightConfig(crossingSettings, lightSettings)

    expect(lightConfig.withOffset(-1_000)).toEqual({
      ...lightSettings,
      offset: 59_000
    })
  })

  it('rounds offset updates to the nearest second', () => {
    let lightConfig = new LightConfig(crossingSettings, lightSettings)

    expect(lightConfig.withOffset(500)).toEqual({
      ...lightSettings,
      offset: 1_000
    })
  })
})
