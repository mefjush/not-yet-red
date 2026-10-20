import { describe, expect, it } from "vitest"
import { beepStep, soundInterval } from "../app/hooks/useCrossingSound"
import { State } from "../app/domain/State"
import TrafficLight from "../app/domain/TrafficLight"
import { SCENARIOS } from "../app/components/scenarios"

const pedestrian = new TrafficLight(SCENARIOS.find((s) => s.layout == "zebra")!.config[1][0], false)
const railway = new TrafficLight(SCENARIOS.find((s) => s.layout == "railway")!.config[0][0], false)

// every slot from the first phase change on: phase start, then every interval until the phase ends
function expectedBeeps(light: TrafficLight, from: number, to: number) {
  const beeps: number[] = []
  for (let start = light.nextStateTimestamp(from); start < to;) {
    const end = light.nextStateTimestamp(start)
    const every = soundInterval(light.currentPhase(start).state)
    for (let slot = start; every != null && slot < end && slot < to; slot += every) beeps.push(slot)
    start = end
  }
  return beeps
}

// run the beep loop like the hook does, with timers waking 1 ms early to 8 ms late
function simulate(light: TrafficLight, from: number, to: number) {
  let seed = 7
  const jitter = () => ((seed = (seed * 16807) % 2147483647) % 10) - 1
  const beeps: number[] = []
  let lastSlot = -Infinity
  for (let t = from; t < to;) {
    const step = beepStep(light, t, lastSlot)
    if (step.beep) beeps.push(step.slot)
    lastSlot = step.slot
    t = Math.max(t, step.wakeAt + jitter())
  }
  return beeps
}

describe("pedestrian crossing sound", () => {
  it("beeps for stop, go and hurry up", () => {
    expect(soundInterval(State.RED)).toBe(1000)
    expect(soundInterval(State.GREEN)).toBe(200)
    expect(soundInterval(State.GREEN_FLASHING)).toBe(100)
  })

  it("rings the bell while a railway crossing flashes", () => {
    expect(soundInterval(State.RED_ALTERNATING)).toBe(500)
    expect(soundInterval(State.NONE)).toBeNull()
  })

  it("stays quiet when the light is broken down", () => {
    expect(soundInterval(State.YELLOW)).toBeNull()
    expect(soundInterval(State.NONE)).toBeNull()
  })

  it.each([
    ["pedestrian crossing", pedestrian],
    ["railway crossing", railway],
  ])("keeps a steady rhythm at a %s, with no sound missing or doubled", (_, light) => {
    const from = 1_000
    const to = 61_000
    const firstChange = light.nextStateTimestamp(from)
    const beeps = simulate(light, from, to).filter((t) => t >= firstChange)

    expect(beeps.length).toBeGreaterThan(0)
    expect(beeps).toEqual(expectedBeeps(light, from, to))
  })

  it("skips a beep the phone woke up too late for instead of playing it late", () => {
    // red: slots every 1000 ms; waking 300 ms after a slot plays nothing
    const redStart = SCENARIOS.find((s) => s.layout == "zebra")!.config[1][0].offset
    const step = beepStep(pedestrian, redStart + 2_300, -Infinity)
    expect(step.beep).toBe(false)
    expect(step.wakeAt).toBe(redStart + 3_000)
  })
})
