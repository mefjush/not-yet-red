interface TimeSyncStrategy {
  url: string,
  parse(json: any): string
}

const timeApiStrategy: TimeSyncStrategy = {
  url: "https://timeapi.io/api/time/current/zone?timeZone=Utc",
  parse: (json: any) => `${json.dateTime}+00:00`
}

const worldTimeApiStrategy: TimeSyncStrategy = {
  url: "https://worldtimeapi.org/api/timezone/Utc",
  parse: (json: any) => json.datetime
}

export default function timeSync(): Promise<number> {
  return new Promise(function (resolve, reject) {
    console.log("Syncing time")

    const strategy = timeApiStrategy
    const request = new XMLHttpRequest()
    const start = Date.now()

    request.open('GET', strategy.url)
    request.setRequestHeader("Accept", "application/json")
    request.onload = function() {
      if (!(request.status >= 200 && request.status < 300)) {
        reject({
          status: request.status,
          statusText: request.statusText
        })
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

          const timeOffset = browserNow - systemNow

          console.log(`Time sync offset: ${timeOffset}`)

          resolve(timeOffset)
        }
      } catch(error) {
        console.log("Time sync failed")
        console.error(error)
        reject({
          status: error,
          statusText: error
        })
      }

    }

    try {
      request.send(null)
    } catch(error) {
      console.log("Time sync failed")
      console.error(error)
      reject({
        status: 666,
        statusText: 'Can\'t send a request'
      })
    }
  })
}

