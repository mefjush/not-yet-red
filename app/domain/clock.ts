interface ClockListener {
  nextStateTimestamp(d: number): number
}

export default class Clock {

  nextTimeout: ReturnType<typeof setTimeout> | null = null
  timeSync: ReturnType<typeof setTimeout> | null = null
  timeCorrection: number | null

  constructor(timeCorrection: number) {
    this.timeCorrection = timeCorrection
  }

  now() {
    return Date.now() - (this.timeCorrection || 0)
  }

  register(listeners: ClockListener[]): Promise<number> {
    const currentTimestamp = this.now()
    const timestamps = listeners.map(listener => listener.nextStateTimestamp(currentTimestamp))
    const nextTimestamp = Math.min(...timestamps)
    const timeToNextTick = Math.max(0, nextTimestamp - currentTimestamp)

    const that = this

    return new Promise(function (resolve, reject) {
      that.nextTimeout = setTimeout(() => resolve(nextTimestamp), timeToNextTick)
    })
  }

  unregister() {
    if (this.nextTimeout != null) {
      clearTimeout(this.nextTimeout)
    }
  }
}
