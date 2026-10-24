import { describe, expect, it } from "vitest"
import { DEFAULT_LIGHT_CONFIG } from "../../app/domain/LightConfig"
import { PRESETS, PresetId, SYMBOLS } from "../../app/domain/Preset"
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

describe("railway crossing preset", () => {
  it("is quiet for 20 s, then flashes red for 10 s", () => {
    const light = DEFAULT_LIGHT_CONFIG.withPreset(PRESETS[PresetId.RAILWAY])

    expect(light.phases.map((p) => [p.state, p.duration])).toEqual([
      [State.NONE, 20_000],
      [State.RED_ALTERNATING, 10_000],
    ])
  })
})

describe("bicycle, warning and tram presets", () => {
  const switchTo = (presetId: PresetId) => DEFAULT_LIGHT_CONFIG.withPreset(PRESETS[presetId])
  const phasesOf = (presetId: PresetId) =>
    switchTo(presetId).phases.map((p) => [p.state, p.duration])

  it("runs a bicycle light like a car light", () => {
    expect(phasesOf(PresetId.BICYCLE)).toEqual(phasesOf(PresetId.FOUR_PHASE))
  })

  it("flashes yellow for the whole cycle", () => {
    expect(phasesOf(PresetId.FLASHING_YELLOW)).toEqual([[State.YELLOW_FLASHING, 30_000]])
  })

  it("runs a tram / bus (SB) signal like a car light, with three different white symbols", () => {
    const sb = PRESETS[PresetId.TRAM_BUS]
    const symbol = SYMBOLS[sb.symbolId]

    expect(phasesOf(PresetId.TRAM_BUS)).toEqual(phasesOf(PresetId.FOUR_PHASE))
    expect(symbol.white).toBe(true)
    expect(new Set(sb.colors.map((c) => symbol.getIcon(c))).size).toBe(3)
    expect(sb.states.map((s) => sb.phaseName(s))).toEqual([
      "Stop (—)",
      "Get ready (— and ··)",
      "Go (|)",
      "Stop if you can (··)",
    ])
  })

  it("shows a tram's bars as stop, go and stop soon, with a 4 s flashing go bar", () => {
    const tram = PRESETS[PresetId.TRAM]

    expect(tram.states.map((s) => tram.phaseName(s))).toEqual([
      "Stop (—)",
      "Go (|)",
      "Stop soon (flashing |)",
    ])
    expect(phasesOf(PresetId.TRAM)).toEqual([
      [State.RED, 16_000],
      [State.GREEN, 10_000],
      [State.GREEN_FLASHING, 4_000],
    ])
  })

  it("keeps the usual phase names for other lights", () => {
    expect(PRESETS[PresetId.BICYCLE].phaseName(State.RED_YELLOW)).toBe("Red-Yellow")
  })
})

describe("lane control preset", () => {
  const lane = PRESETS[PresetId.LANE_CONTROL]

  it("closes, opens, then asks drivers to leave the lane for 4 s", () => {
    const light = DEFAULT_LIGHT_CONFIG.withPreset(lane)

    expect(light.phases.map((p) => [p.state, p.duration])).toEqual([
      [State.RED, 16_000],
      [State.GREEN, 10_000],
      [State.YELLOW_FLASHING, 4_000],
    ])
    expect(lane.states.map((s) => lane.phaseName(s))).toEqual([
      "Lane closed (✕)",
      "Lane open (↓)",
      "Leave the lane (↘)",
    ])
  })

  it("shows one symbol per colour on a single display", () => {
    const symbol = SYMBOLS[lane.symbolId]
    const icons = lane.colors.map((c) => symbol.getIcon(c))

    expect(lane.singleLens).toBe(true)
    expect(new Set(icons).size).toBe(3)
  })
})
