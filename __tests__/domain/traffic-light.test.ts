import { STATE } from '../../app/domain/state'
import LightConfig from '../../app/domain/light-config'
import TrafficLight from  '../../app/domain/traffic-light'

let crossingSettings = {
  cycleLength: 60_000,
  failure: {
    probability: 0,
    duration: 0
  }
}

let lightSettings = {
  offset: 0,
  phases: [
    { state: STATE.RED, duration: 30_000 },
    { state: STATE.RED_YELLOW, duration: 2_000 },
    { state: STATE.GREEN, duration: 26_000 },
    { state: STATE.YELLOW, duration: 2_000 }
  ]
}

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

    expect(trafficLight.currentPhase(10_000).state).toBe(STATE.RED)
  })

  it('calculates current phase when at the very beginning of the current phase', () => {
    let trafficLight = new TrafficLight(new LightConfig(crossingSettings, lightSettings), false)

    expect(trafficLight.currentPhase(60_000).state).toBe(STATE.RED)
  })
})
