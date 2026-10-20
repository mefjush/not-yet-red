import { describe, expect, it } from "vitest"
import { SCENARIOS, SceneLayout } from "../app/components/scenarios"
import TrafficLight from "../app/domain/TrafficLight"
import { State } from "../app/domain/State"

// pairs of lights (flat order) whose traffic would collide; right-hand traffic
const CONFLICTS: [SceneLayout, number[][]][] = [
  // 0 cars, 1 pedestrians
  ["zebra", [[0, 1]]],
  // 0 west road, 1 east road, 2 side road left arrow, 3 side road right arrow;
  // west+east may go together (east's left-turners give way, like at any junction without
  // arrows), as may east+right arrow and the two arrows
  [
    "tJunction",
    [
      [0, 2], // side road turning left crosses west
      [0, 3], // side road turning right merges into west's lane
      [1, 2], // side road turning left merges into east's lane
    ],
  ],
]

// yellow and flashing green still count as moving: traffic may be clearing the crossing
const moving = (s: State) => s == State.GREEN || s == State.YELLOW || s == State.GREEN_FLASHING

describe.each(CONFLICTS)("%s scenario", (layout, conflicts) => {
  const scenario = SCENARIOS.find((s) => s.layout == layout)!
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
      for (const [a, b] of conflicts) {
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
