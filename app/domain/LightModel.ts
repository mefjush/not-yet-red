import LightConfig, { LightSettings, PresetId, PRESETS } from "./LightConfig";
import LightUiState from "./LightUiState";
import { State } from "./State"

export default class LightModel {

  constructor(private lightConfig: LightConfig, private lightUiState: LightUiState, private updateLightSettings: (ls: LightSettings) => void, private updateLightUiState: (l: LightUiState) => void, private updateSelection: (b: boolean) => void) {
  }

  getSelectedState(): State {
    return this.lightUiState.selectedState
  }

  setSelectedState(state: State) {
    this.updateLightUiState(this.lightUiState.withSelectedState(state))
  }

  isSelected() {
    return this.lightUiState.isSelected
  }

  setSelected(value: boolean) {
    if (value != this.isSelected()) {
      this.updateLightUiState(this.lightUiState.withSelected(value))
      this.updateSelection(value)
    }
  }

  changePreset(presetId: PresetId) {
    const supportedStates = PRESETS[presetId].states
    if (!supportedStates.includes(this.getSelectedState())) {
      this.setSelectedState(supportedStates[0])
    }
    this.updateLightSettings(this.lightConfig.withPreset(presetId))
  }
}
