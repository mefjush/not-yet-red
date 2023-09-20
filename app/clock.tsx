const DEFAULT_FAILURE_DURATION = 10000;
const DEFAULT_FAILURE_PROBABILITY = 0.1;

interface ClockListener {
  nextStateTimestamp(d: number): number;
}

export default class Clock {

  nextTimeout: ReturnType<typeof setTimeout> | null = null

  register(listeners: ClockListener[], tickCallback: any) {
    const currentTimestamp = Date.now()
    const timestamps = listeners.map(listener => listener.nextStateTimestamp(currentTimestamp))
    const timeToNextTick = Math.max(0, Math.min(...timestamps) - currentTimestamp)

    this.nextTimeout = setTimeout(function() {
      const currentTimestamp = Date.now()
      tickCallback(currentTimestamp)
    }, timeToNextTick)
  }

  unregister() {
    if (this.nextTimeout != null) {
      clearTimeout(this.nextTimeout)
    }
  }
}



