import LightConfig, { Phase } from "./domain/LightConfig"
import { State } from "./domain/State"
import IntersectionConfig from "./domain/IntersectionConfig"
import { PresetId, PRESETS } from "./domain/Preset"

const stateLookup = Object.values(State).map((state) => [
  state,
  state
    .split("_")
    .map((x) => x.charAt(0))
    .join(""),
])
const stateSerializationLookup = Object.fromEntries(stateLookup)
const stateDeserializationLookup = Object.fromEntries(stateLookup.map(([k, v]) => [v, k]))

export function lightConfigParser(intersectionConfig: IntersectionConfig) {
  return {
    serialize: (lightConfigs: LightConfig[]) => {
      return lightConfigs
        .map((ls) =>
          [
            ls.offset / 1000,
            ls.phases.map((p) => stateSerializationLookup[p.state] + p.duration / 1000).join("-"),
            ls.preset.presetId,
          ].join("--"),
        )
        .join("---")
    },
    parse: (s: string) => {
      return s.split("---").map((ls) => {
        const lsSplit = ls.split("--")
        return new LightConfig(
          intersectionConfig,
          1000 * Number.parseInt(lsSplit[0]),
          lsSplit[1].split("-").map((ph) => {
            const phSplit = ph.match(/[a-zA-Z_]+|[0-9]+/g) || []
            const stateName = stateDeserializationLookup[phSplit[0] as string] as keyof typeof State
            return new Phase(State[stateName], 1000 * Number.parseInt(phSplit[1]))
          }),
          PRESETS[lsSplit[2] as PresetId],
        )
      })
    }
  }
}

export const IntersectionConfigParser = {
  serialize: (intersectionConfig: IntersectionConfig) => {
    return [
      intersectionConfig.cycleLength / 1000,
      intersectionConfig.failure.duration / 1000,
      intersectionConfig.failure.probability,
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
