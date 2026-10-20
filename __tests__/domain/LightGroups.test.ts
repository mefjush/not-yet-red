import { describe, expect, test, it } from "vitest"
import { DEFAULT_LIGHT_CONFIG, TEST_LIGHT_CONFIG } from "../../app/domain/LightConfig"
import LightGroups from "../../app/domain/LightGroups"

const light1 = TEST_LIGHT_CONFIG
const light2 = DEFAULT_LIGHT_CONFIG

describe("LightGroups", () => {
  it("allow to lookup the light by lightIdx", () => {
    const lightGroups = new LightGroups([[light1]])

    expect(lightGroups.lookup(0)).toEqual(light1)
  })

  it("with 2 light has size of 2", () => {
    const lightGroups = new LightGroups([[light1], [light2]])

    expect(lightGroups.size()).toEqual(2)
  })

  it("moves a light to another group", () => {
    const lightGroups = new LightGroups([[light1], [light2]])

    expect(lightGroups.withLightMoved(0, 1).raw()).toEqual([[light2, light1]])
  })

  it("moves a light to a new group", () => {
    const lightGroups = new LightGroups([[light1, light2]])

    expect(lightGroups.withLightMoved(0, 1).raw()).toEqual([[light2], [light1]])
  })

  it("moves a light out of the first group into a later one", () => {
    const lightGroups = new LightGroups(["a", "b", "c"].map((x) => [x]))

    expect(lightGroups.withLightMoved(0, 2).raw()).toEqual([["b"], ["c", "a"]])
  })

  it("adds a light to an existing group", () => {
    const lightGroups = new LightGroups([[light1], [light2]])

    expect(lightGroups.withLightAdded(light1, 0).raw()).toEqual([[light1, light1], [light2]])
  })

  it("allows to add one light", () => {
    const lightGroups = new LightGroups([])

    const updated = lightGroups.withLightAdded(light1)

    expect(updated.raw()).toEqual([[light1]])
  })

  it("allows to delete one light from a group", () => {
    const lightGroups = new LightGroups([[light1, light2]])

    const updated = lightGroups.withLightDeleted(1)

    expect(updated.raw()).toEqual([[light1]])
  })

  it("allows to delete one light", () => {
    const lightGroups = new LightGroups([[light1], [light2]])

    const updated = lightGroups.withLightDeleted(1)

    expect(updated.raw()).toEqual([[light1]])
  })
})
