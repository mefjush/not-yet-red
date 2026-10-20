import { describe, expect, test, it } from "vitest"
import { DEFAULT_INTERSECTION_CONFIG } from "../app/domain/IntersectionConfig"
import { DEFAULT_LIGHT_CONFIG as DEFAULT_LIGHT_CONFIG } from "../app/domain/LightConfig"
import { IntersectionConfigParser, lightConfigParser } from "../app/url"
import { SCENARIOS } from "../app/components/scenarios"

describe("Url", () => {
  it("serializes LightConfig back and forth", () => {
    const parser = lightConfigParser(DEFAULT_INTERSECTION_CONFIG)
    const serialized = parser.serialize([DEFAULT_LIGHT_CONFIG])

    console.log(serialized)

    expect(parser.parse(serialized)).toEqual([DEFAULT_LIGHT_CONFIG])
  })

  it("serializes a 3-phase pedestrian light back and forth", () => {
    const parser = lightConfigParser(DEFAULT_INTERSECTION_CONFIG)
    const pedestrian = SCENARIOS.find((s) => s.layout == "zebra")!.config[1]
    const serialized = parser.serialize(pedestrian)

    expect(serialized).toContain("GF4")
    expect(parser.parse(serialized)).toEqual(pedestrian)
  })

  it("serializes a railway crossing light back and forth", () => {
    const parser = lightConfigParser(DEFAULT_INTERSECTION_CONFIG)
    const railway = SCENARIOS.find((s) => s.layout == "railway")!.config[0]
    const serialized = parser.serialize(railway)

    expect(serialized).toBe("0--N20-RA10--RAILWAY")
    expect(parser.parse(serialized)).toEqual(railway)
  })

  it("serializes IntersectionConfgi back and forth", () => {
    const serialized = IntersectionConfigParser.serialize(DEFAULT_INTERSECTION_CONFIG)

    console.log(serialized)

    expect(IntersectionConfigParser.parse(serialized)).toEqual(DEFAULT_INTERSECTION_CONFIG)
  })
})
