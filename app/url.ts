import { LightSettings, Phase } from "./domain/LightConfig"
import { State } from "./domain/State"
import IntersectionSettings from "./domain/IntersectionSettings"
import { PresetId } from "./domain/Preset"

const stateLookup = Object.values(State).map((state) => [
  state,
  state
    .split("_")
    .map((x) => x.charAt(0))
    .join(""),
])
const stateSerializationLookup = Object.fromEntries(stateLookup)
const stateDeserializationLookup = Object.fromEntries(stateLookup.map(([k, v]) => [v, k]))

export const LightSettingsParser = {
  serialize: (lightSettingsArray: LightSettings[]) => {
    return lightSettingsArray
      .map((ls) =>
        [
          ls.offset / 1000,
          ls.phases.map((p) => stateSerializationLookup[p.state] + p.duration / 1000).join("-"),
          ls.presetId,
        ].join("--"),
      )
      .join("---")
  },
  parse: (s: string) => {
    return s.split("---").map((ls) => {
      const lsSplit = ls.split("--")
      return {
        offset: 1000 * Number.parseInt(lsSplit[0]),
        phases: lsSplit[1].split("-").map((ph) => {
          const phSplit = ph.match(/[a-zA-Z_]+|[0-9]+/g) || []
          const stateName = stateDeserializationLookup[phSplit[0] as string] as keyof typeof State
          return new Phase(State[stateName], 1000 * Number.parseInt(phSplit[1]))
        }),
        presetId: lsSplit[2] as PresetId,
      }
    })
  },
}

export const IntersectionSettingsParser = {
  serialize: (intersectionSettings: IntersectionSettings) => {
    return [
      intersectionSettings.cycleLength / 1000,
      intersectionSettings.failure.duration / 1000,
      intersectionSettings.failure.probability,
    ].join("-")
  },
  parse: (s: string) => {
    const split = s.split("-")
    return {
      cycleLength: 1000 * Number.parseInt(split[0]),
      failure: {
        duration: 1000 * Number.parseInt(split[1]),
        probability: Number.parseFloat(split[2]),
      },
    }
  },
}
