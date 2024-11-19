interface ClockListener {
  nextStateTimestamp(d: number): number
}

export default class Clock {

  nextTimeout: ReturnType<typeof setTimeout> | null = null
  timeSync: ReturnType<typeof setTimeout> | null = null
  timeOffset: number | null

  constructor(timeCorrection: number) {
    this.timeOffset = timeCorrection
  }

  register(listeners: ClockListener[], tickCallback: (timestamp: number) => void) {
    const currentTimestamp = Date.now() - (this.timeOffset || 0)
    const timestamps = listeners.map(listener => listener.nextStateTimestamp(currentTimestamp))
    const nextTimestamp = Math.min(...timestamps)
    const timeToNextTick = Math.max(0, nextTimestamp - currentTimestamp)

    this.nextTimeout = setTimeout(function() {
      tickCallback(nextTimestamp)
    }, timeToNextTick)
  }

  unregister() {
    if (this.nextTimeout != null) {
      clearTimeout(this.nextTimeout)
    }
  }
}
