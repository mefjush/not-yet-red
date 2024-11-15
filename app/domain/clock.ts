const WORLDTIMEAPI_URL = "https://worldtimeapi.org/api/timezone/Utc"
const TIMEAPI_URL = "https://timeapi.io/api/time/current/zone?timeZone=Utc"

interface ClockListener {
  nextStateTimestamp(d: number): number
}

interface TimeSyncStrategy {
  url: string,
  parse(json: any): string
}

const timeApiStrategy : TimeSyncStrategy = {
  url: TIMEAPI_URL,
  parse: (json: any) => `${json.dateTime}+00:00`
}

const worldTimeApiStrategy : TimeSyncStrategy = {
  url: WORLDTIMEAPI_URL,
  parse: (json: any) => json.datetime
}

let timeOffset: number | null = null
let timeSyncTry: number = 0

function syncTime(tickCallback: (timestamp: number) => void) {
  timeSyncTry += 1
  console.log("Syncing time")

  const strategy = timeApiStrategy

  let request = new XMLHttpRequest()
  let start = Date.now()

  request.open('GET', strategy.url)
  request.setRequestHeader("Accept", "application/json")

  request.onreadystatechange = function() {
    if (request.readyState != 4) {
      return
    }

    try {
      const browserNow = Date.now()
      const latency = browserNow - start
      const timestring = strategy.parse(JSON.parse(request.response))

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
  try {
    request.send(null)
  } catch(error) {
    console.log("Time sync failed")
    console.error(error)
    timeOffset = 0
  }
}

export default class Clock {

  nextTimeout: ReturnType<typeof setTimeout> | null = null
  timeSync: ReturnType<typeof setTimeout> | null = null

  register(listeners: ClockListener[], tickCallback: (timestamp: number) => void, fixedTimeOffset: number|null = null) {
    console.log(`Register of ${ listeners.length } listeners`)

    if (timeOffset == null) {
      if (fixedTimeOffset == null && !this.timeSync && timeSyncTry < 5) {
        this.timeSync = setTimeout(() => syncTime((timestamp) => {
          this.timeSync = null
          tickCallback(timestamp)
        }), 2000) //so it synces when everything is loaded
      } else {
        timeOffset = fixedTimeOffset
      }
    }

    const currentTimestamp = Date.now() - (timeOffset || 0)
    const timestamps = listeners.map(listener => listener.nextStateTimestamp(currentTimestamp))
    const nextTimestamp = Math.min(...timestamps)
    const timeToNextTick = Math.max(0, nextTimestamp - currentTimestamp)

    this.nextTimeout = setTimeout(function() {
      tickCallback(nextTimestamp)
    }, timeToNextTick)


    // this.nextTimeout = setTimeout(function() {
    //   tickCallback(Date.now() - (timeOffset || 0))
    // }, 1000)
  }

  unregister() {
    if (this.nextTimeout != null) {
      clearTimeout(this.nextTimeout)
    }
  }
}
