import LightUiState from "./LightUiState";
import { State } from "./State"

export default class LightModel {

  constructor(private lightUiState: LightUiState, private updateLightUiState: (l: LightUiState) => void, private updateSelection: (b: boolean) => void) {
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
}
