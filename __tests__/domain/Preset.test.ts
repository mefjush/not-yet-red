import { describe, expect, it } from "vitest"
import { DEFAULT_LIGHT_CONFIG } from "../../app/domain/LightConfig"
import { PRESETS, PresetId } from "../../app/domain/Preset"
import { State } from "../../app/domain/State"

describe("3-phase pedestrian preset", () => {
  const durationOf = (phases: { state: State; duration: number }[], state: State) =>
    phases.find((p) => p.state == state)?.duration

  it("adds a 4 s flashing green, as Polish signal rules require", () => {
    for (const from of [
      DEFAULT_LIGHT_CONFIG,
      DEFAULT_LIGHT_CONFIG.withPreset(PRESETS[PresetId.PEDESTRIAN]),
    ]) {
      const light = from.withPreset(PRESETS[PresetId.PEDESTRIAN_FLASHING])

      expect(light.phases.map((p) => p.state)).toEqual([
        State.RED,
        State.GREEN,
        State.GREEN_FLASHING,
      ])
      expect(durationOf(light.phases, State.GREEN_FLASHING)).toBe(4_000)
      expect(light.phases.reduce((sum, p) => sum + p.duration, 0)).toBe(light.cycleLength())
    }
  })
})
