const TIME_SYNC_URL = "https://worldtimeapi.org/api/timezone/Utc"

interface ClockListener {
  nextStateTimestamp(d: number): number
}

let timeOffset: number | null = null

function syncTime(tickCallback: (timestamp: number) => void) {
  console.log("Syncing time")
  let request = new XMLHttpRequest()
  let start = Date.now()

  request.open('GET', TIME_SYNC_URL, false)
  request.onreadystatechange = function() {
    if (request.readyState != 4) {
      return
    }

    try {
      const browserNow = Date.now()
      const latency = browserNow - start
      const timestring = JSON.parse(request.response).datetime

      if (timestring) {
        // Set the time to the **slightly old** date sent from the 
        // server, then adjust it to a good estimate of what the
        // server time is **right now**.
        const systemtime = new Date(timestring)
        systemtime.setMilliseconds(systemtime.getMilliseconds() + (latency / 2))
        const systemNow = systemtime.getTime()

        timeOffset = browserNow - systemNow

        console.log(`Time sync offset: ${timeOffset}`)

        tickCallback(systemNow)
      }
    } catch(error) {
      console.log("Time sync failed")
      console.error(error)
      timeOffset = 0
    }
  }
  request.send(null)
}

export default class Clock {

  nextTimeout: ReturnType<typeof setTimeout> | null = null

  register(listeners: ClockListener[], tickCallback: (timestamp: number) => void, fixedTimeOffset: number|null = null) {
    console.log(`Register of ${ listeners.length } listeners`)

    if (timeOffset == null) {
      if (fixedTimeOffset == null) {
        setTimeout(() => syncTime(tickCallback), 2000) //so it synces when everything is loaded
      } else {
        timeOffset = fixedTimeOffset
      }
    }

    const currentTimestamp = Date.now() - (timeOffset || 0)
    const timestamps = listeners.map(listener => listener.nextStateTimestamp(currentTimestamp))
    const nextTimestamp =  Math.min(...timestamps)
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
