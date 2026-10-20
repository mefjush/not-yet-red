import { useEffect, useState } from "react"

// false on the server and while hydrating, true right after: lets time-dependent UI render
// a fixed moment first so server HTML and the first client render match
export default function useHydrated() {
  const [hydrated, setHydrated] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect -- the one-off re-render after hydration is the point
  useEffect(() => setHydrated(true), [])
  return hydrated
}
