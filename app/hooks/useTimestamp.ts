import { useEffect, useState } from "react"
import Clock, { ClockListener } from "../domain/Clock"
import useHydrated from "./useHydrated"

// current time, re-rendering whenever one of the listeners (e.g. lights) changes state
export default function useTimestamp(listeners: ClockListener[]) {
  const [timestamp, setTimestamp] = useState(() => Date.now())

  useEffect(() => {
    if (listeners.length == 0) return
    const clock = new Clock(0)
    clock.register(listeners).then(setTimestamp)
    return () => clock.unregister()
  })

  return useHydrated() ? timestamp : 0
}
