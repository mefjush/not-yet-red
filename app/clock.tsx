const DEFAULT_FAILURE_DURATION = 10000;
const DEFAULT_FAILURE_PROBABILITY = 0.1;

interface ClockListener {
  nextStateTimestamp(d: number): number;
}

let timeOffset: number | null = null

function syncTime() {
  // Set up our time object, synced by the HTTP DATE header
  // Fetch the page over JS to get just the headers
  console.log("syncing time")
  var r = new XMLHttpRequest()
  var start = (new Date).getTime()

  r.open('HEAD', document.location.toString(), false)
  r.onreadystatechange = function() {
    if (r.readyState != 4) {
      return;
    }
    const latency = (new Date).getTime() - start
    const timestring = r.getResponseHeader("DATE")

    if (timestring) {
      // Set the time to the **slightly old** date sent from the 
      // server, then adjust it to a good estimate of what the
      // server time is **right now**.
      const systemtime = new Date(timestring)
      
      systemtime.setMilliseconds(systemtime.getMilliseconds() + (latency / 2))

      timeOffset = (new Date).getTime() - systemtime.getTime()

      console.log(`offset: ${timeOffset}`)
    }
  }
  r.send(null)
}

export default class Clock {

  nextTimeout: ReturnType<typeof setTimeout> | null = null

  register(listeners: ClockListener[], tickCallback: any) {
    if (!timeOffset) {
      syncTime()
    }

    const currentTimestamp = Date.now() - (timeOffset || 0)
    const timestamps = listeners.map(listener => listener.nextStateTimestamp(currentTimestamp))
    const timeToNextTick = Math.max(0, Math.min(...timestamps) - currentTimestamp)

    this.nextTimeout = setTimeout(function() {
      const currentTimestamp = Date.now() - (timeOffset || 0)
      tickCallback(currentTimestamp)
    }, timeToNextTick)
  }

  unregister() {
    if (this.nextTimeout != null) {
      clearTimeout(this.nextTimeout)
    }
  }
}



