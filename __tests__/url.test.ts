import { DEFAULT_INTERSECTION_CONFIG } from "../app/domain/IntersectionConfig"
import { DEFAULT_LIGHT_CONFIG as DEFAULT_LIGHT_CONFIG } from "../app/domain/LightConfig"
import { IntersectionConfigParser, lightConfigParser } from "../app/url"

describe("Url", () => {
  it("serializes LightConfig back and forth", () => {
    const parser = lightConfigParser(DEFAULT_INTERSECTION_CONFIG)
    const serialized = parser.serialize([DEFAULT_LIGHT_CONFIG])

    console.log(serialized)

    expect(parser.parse(serialized)).toEqual([DEFAULT_LIGHT_CONFIG])
  })

  it("serializes IntersectionConfgi back and forth", () => {
    const serialized = IntersectionConfigParser.serialize(DEFAULT_INTERSECTION_CONFIG)

    console.log(serialized)

    expect(IntersectionConfigParser.parse(serialized)).toEqual(DEFAULT_INTERSECTION_CONFIG)
  })
})
