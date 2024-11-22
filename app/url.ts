import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { LightSettings, Phase, PresetId } from "./domain/light-config"
import { State } from "./domain/state"
import CrossingSettings from "./domain/crossing-settings"

const stateLookup = Object.values(State).map(state => [state, state.split('_').map(x => x.charAt(0)).join('')])
const stateSerializationLookup = Object.fromEntries(stateLookup)
const stateDeserializationLookup = Object.fromEntries(stateLookup.map(([k, v]) => [v, k]))

console.log(stateDeserializationLookup)

interface SerDeser<T> {
  serialize: (state: T) => string
  deserialize: (state: string) => T
}

export const BooleanSerDeser: SerDeser<boolean> = {
  serialize: (s: Boolean) => (s ? 'true' : 'false'),
  deserialize: (s: string) => s === 'true'
}

export const LightSettingsSerDeser: SerDeser<LightSettings[]> = {
  serialize: (lightSettingsArray: LightSettings[]) => {
    return lightSettingsArray
      .map(ls => ls.offset + "--" + ls.phases.map(p => stateSerializationLookup[p.state] + p.duration).join("-") + "--" + ls.presetId)
      .join("---")
  },
  deserialize: (s: string) => {
    return s.split("---").map(ls => {
      const lsSplit = ls.split("--")
      return {
        offset: Number.parseInt(lsSplit[0]), 
        phases: lsSplit[1].split("-").map(ph => { 
          const phSplit = ph.match(/[a-zA-Z_]+|[0-9]+/g) || []
          const stateName = stateDeserializationLookup[phSplit[0] as string] as keyof typeof State 
          return new Phase(State[stateName], Number.parseInt(phSplit[1]))
        }),
        presetId: lsSplit[2] as PresetId
      }
    })
  }
}

export const CrossingSettingsSerDeser: SerDeser<CrossingSettings> = {
  serialize: (crossingSettings: CrossingSettings) => {
    return crossingSettings.cycleLength + "-" + crossingSettings.failure.duration + "-" + crossingSettings.failure.probability
  },
  deserialize: (s: string) => {
    let split = s.split("-")
    return {
      cycleLength: Number.parseInt(split[0]),
      failure: {
        duration: Number.parseInt(split[1]),
        probability: Number.parseFloat(split[2])
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
