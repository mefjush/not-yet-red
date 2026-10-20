import { describe, expect, it } from "vitest"
import { SCENARIOS } from "../app/components/scenarios"
import TrafficLight from "../app/domain/TrafficLight"
import { State } from "../app/domain/State"

// lights in flat order: 0 west road, 1 east road, 2 side road left arrow, 3 side road right arrow
// right-hand traffic; west+east may go together (east's left-turners give way, like at any
// junction without arrows), as may east+right arrow and the two arrows
const T_JUNCTION_CONFLICTS = [
  [0, 2], // side road turning left crosses west
  [0, 3], // side road turning right merges into west's lane
  [1, 2], // side road turning left merges into east's lane
]

describe("T-junction scenario", () => {
  const scenario = SCENARIOS.find((s) => s.layout == "tJunction")!
  const lights = scenario.config.flat().map((config) => new TrafficLight(config, false))
  const cycle = lights[0].cycleLength

  it("gives every light a green phase", () => {
    for (const light of lights) {
      const greens = Array.from({ length: cycle / 500 }, (_, i) => light.currentPhase(i * 500))
      expect(greens.some((phase) => phase.state == State.GREEN)).toBe(true)
    }
  })

  it("never lets conflicting traffic move at the same time", () => {
    for (let t = 0; t < cycle; t += 500) {
      const states = lights.map((light) => light.currentPhase(t).state)
      for (const [a, b] of T_JUNCTION_CONFLICTS) {
        // yellow still counts as moving: cars may be clearing the junction
        const moving = (s: State) => s == State.GREEN || s == State.YELLOW
        const clash =
          (moving(states[a]) && states[b] == State.GREEN) ||
          (moving(states[b]) && states[a] == State.GREEN)
        expect(clash, `lights ${a} and ${b} at ${t / 1000}s: ${states[a]} / ${states[b]}`).toBe(
          false,
        )
      }
    }
  })
})
