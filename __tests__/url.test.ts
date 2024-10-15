import { DEFAULT_CROSSING_SETTINGS } from "../app/domain/crossing-settings"
import { DEFAULT_LIGHT_SETTINGS } from "../app/domain/light-config"
import { CrossingSettingsSerDeser, LightSettingsSerDeser } from "../app/url"

describe('Url', () => {
  it('serializes LightSettings back and forth', () => {
    let serialized = LightSettingsSerDeser.serialize([DEFAULT_LIGHT_SETTINGS])

    console.log(serialized)

    expect(LightSettingsSerDeser.deserialize(serialized)).toEqual([DEFAULT_LIGHT_SETTINGS])
  })

  it('serializes CrossingSettings back and forth', () => {
    let serialized = CrossingSettingsSerDeser.serialize(DEFAULT_CROSSING_SETTINGS)

    console.log(serialized)

    expect(CrossingSettingsSerDeser.deserialize(serialized)).toEqual(DEFAULT_CROSSING_SETTINGS)
  })
})
