import { Stack, Select, MenuItem } from "@mui/material"
import { createElement } from "react"
import LightConfig from "../domain/LightConfig"
import CircleIcon from "@mui/icons-material/Circle"
import { PresetId, PRESETS, SYMBOLS, SymbolId } from "../domain/Preset"
import { State } from "../domain/State"

export default function PresetMenu({
  lightConfig,
  selectedState,
  onLightConfigChange,
  setSelectedState,
}: {
  lightConfig: LightConfig
  selectedState: State
  onLightConfigChange: (lightConfig: LightConfig) => void
  setSelectedState: (state: State) => void
}) {
  const generatePresetMenuItems = () => {
    return Object.values(PRESETS).map((preset) => {
      const icon = preset.symbolId != SymbolId.NONE ? SYMBOLS[preset.symbolId].icon : CircleIcon
      const iconElement = createElement(icon, {})
      return (
        <MenuItem key={preset.presetId} value={preset.presetId}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            {iconElement}
            <span>{preset.name}</span>
          </Stack>
        </MenuItem>
      )
    })
  }

  const changePreset = (presetId: PresetId) => {
    const supportedStates = PRESETS[presetId].states
    if (!supportedStates.includes(selectedState)) {
      setSelectedState(supportedStates[0])
    }
    onLightConfigChange(lightConfig.withPreset(PRESETS[presetId]))
  }

  return (
    <>
      <Select
        fullWidth
        size="small"
        value={lightConfig.preset.presetId}
        onChange={(event) => changePreset(event.target.value as PresetId)}
      >
        {generatePresetMenuItems()}
      </Select>
    </>
  )
}
