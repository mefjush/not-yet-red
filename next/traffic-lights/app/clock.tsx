const DEFAULT_FAILURE_DURATION = 10000;
const DEFAULT_FAILURE_PROBABILITY = 0.1;

export default class Clock {

  register(listeners, tickCallback) {
    if (this.listeners) {
      console.log("Double register!!!");
    }

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



