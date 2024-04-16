import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface SerDeser<T> {
  serialize: (state: T) => string
  deserialize: (state: string) => T
}

export const BooleanSerDeser: SerDeser<boolean> = {
  serialize: (s: Boolean) => (s ? 'true' : 'false'),
  deserialize: (s: string) => s === 'true'
}

export function objectSerDeser<T>(): SerDeser<T> {
  return {
    serialize: (s: T) => new URLSearchParams(JSON.stringify(s)).toString(),
    deserialize: (s: string) => {
      const params = new URLSearchParams(`key=${s}`)
      const key = params.get('key')
      if (key != null) {
        return JSON.parse(key.slice(0, -1)) as T
      } else {
        return null as T
      }
    } 
  }
}

export default function useStateParams<T>(
    initialState: T,
    paramsName: string,
    serdeser: SerDeser<T>
  ): [T, (state: T) => void] {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const search = new URLSearchParams(searchParams)
  
    const existingValue = search.get(paramsName)

    const [state, setState] = useState<T>(
      existingValue ? serdeser.deserialize(existingValue) : initialState
    )
  
    useEffect(() => {
      // Updates state when user navigates backwards or forwards in browser history
      if (existingValue && serdeser.deserialize(existingValue) !== state) {
        setState(serdeser.deserialize(existingValue))
      }
    }, [existingValue])
  
    const onChange = (s: T) => {
      setState(s)
      search.set(paramsName, serdeser.serialize(s))
      router.push(pathname + "?" + search.toString(), { scroll: false })
    }
  
    return [state, onChange]
  }
