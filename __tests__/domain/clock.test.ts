import Clock from '../../app/domain/clock'

const testListener = (fixedTimestamp: number) => ({
  nextStateTimestamp: (timestamp: number) => fixedTimestamp
})

describe('Clock', () => {

  it('ticks on timestamp', () => {
    const listener = testListener(10000)

    const clock = new Clock(0)

    return expect(clock.register([listener])).resolves.toBe(10000)
  })

  it('ticks on earliest timestamp', () => {
    const earlyListener = testListener(10000)
    const lateListener = testListener(20000)

    const clock = new Clock(0)

    return expect(clock.register([lateListener, earlyListener])).resolves.toBe(10000)
  })
})
