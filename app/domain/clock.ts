interface ClockListener {
  nextStateTimestamp(d: number): number
}

interface TimeSyncStrategy {
  url: string,
  parse(json: any): string
}

const timeApiStrategy : TimeSyncStrategy = {
  url: "https://timeapi.io/api/time/current/zone?timeZone=Utc",
  parse: (json: any) => `${json.dateTime}+00:00`
}

const worldTimeApiStrategy : TimeSyncStrategy = {
  url: "https://worldtimeapi.org/api/timezone/Utc",
  parse: (json: any) => json.datetime
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
