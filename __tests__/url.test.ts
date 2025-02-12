import { DEFAULT_INTERSECTION_SETTINGS } from "../app/domain/IntersectionSettings"
import { DEFAULT_LIGHT_SETTINGS } from "../app/domain/LightConfig"
import { IntersectionSettingsParser, LightSettingsParser } from "../app/url"

describe("Url", () => {
  it("serializes LightSettings back and forth", () => {
    const serialized = LightSettingsParser.serialize([DEFAULT_LIGHT_SETTINGS])

    console.log(serialized)

    expect(LightSettingsParser.parse(serialized)).toEqual([DEFAULT_LIGHT_SETTINGS])
  })

  it("serializes IntersectionSettings back and forth", () => {
    const serialized = IntersectionSettingsParser.serialize(DEFAULT_INTERSECTION_SETTINGS)

    console.log(serialized)

    expect(IntersectionSettingsParser.parse(serialized)).toEqual(DEFAULT_INTERSECTION_SETTINGS)
  })
})
