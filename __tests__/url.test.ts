import { DEFAULT_INTERSECTION_SETTINGS } from "../app/domain/IntersectionSettings"
import { DEFAULT_LIGHT_SETTINGS } from "../app/domain/LightConfig"
import { IntersectionSettingsSerDeser, LightSettingsSerDeser } from "../app/url"

describe('Url', () => {
  it('serializes LightSettings back and forth', () => {
    let serialized = LightSettingsSerDeser.serialize([DEFAULT_LIGHT_SETTINGS])

    console.log(serialized)

    expect(LightSettingsSerDeser.deserialize(serialized)).toEqual([DEFAULT_LIGHT_SETTINGS])
  })

  it('serializes IntersectionSettings back and forth', () => {
    let serialized = IntersectionSettingsSerDeser.serialize(DEFAULT_INTERSECTION_SETTINGS)

    console.log(serialized)

    expect(IntersectionSettingsSerDeser.deserialize(serialized)).toEqual(DEFAULT_INTERSECTION_SETTINGS)
  })
})
