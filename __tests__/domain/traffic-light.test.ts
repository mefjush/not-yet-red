import { State } from '../../app/domain/state'
import LightConfig, { DEFAULT_LIGHT_SETTINGS } from '../../app/domain/light-config'
import TrafficLight from  '../../app/domain/traffic-light'

let crossingSettings = {
  cycleLength: 60_000,
  failure: {
    probability: 0,
    duration: 0
  }
}

let lightSettings = DEFAULT_LIGHT_SETTINGS

describe('TrafficLight', () => {
  it('calculates next transition when in the middle of first phase', () => {
    let trafficLight = new TrafficLight(new LightConfig(crossingSettings, lightSettings), false)

    expect(trafficLight.nextTransition(10_000)).toEqual({ phaseIdx: 1, timestamp: 30000 })
  })

  it('calculates next transition when at the very beginning of the first phase', () => {
    let trafficLight = new TrafficLight(new LightConfig(crossingSettings, lightSettings), false)

    expect(trafficLight.nextTransition(60_000)).toEqual({ phaseIdx: 1, timestamp: 90_000 })
  })

  it('calculates next transition when in the middle of last phase', () => {
    let trafficLight = new TrafficLight(new LightConfig(crossingSettings, lightSettings), false)

    expect(trafficLight.nextTransition(59_000)).toEqual({ phaseIdx: 0, timestamp: 60_000 })
  })

  it('calculates current phase when in the middle of the current phase', () => {
    let trafficLight = new TrafficLight(new LightConfig(crossingSettings, lightSettings), false)

    expect(trafficLight.currentPhase(10_000).state).toBe(State.RED)
  })

  it('calculates current phase when at the very beginning of the current phase', () => {
    let trafficLight = new TrafficLight(new LightConfig(crossingSettings, lightSettings), false)

    expect(trafficLight.currentPhase(60_000).state).toBe(State.RED)
  })
})
