import { State } from "./State"

export default class LightUiState {

  isSelected: boolean
  selectedState: State

  constructor(isSelected: boolean, selectedState: State) {
    this.isSelected = isSelected
    this.selectedState = selectedState
  }

  withSelectedState(state: State): LightUiState {
    return new LightUiState(this.isSelected, state)
  }

  withSelected(value: boolean): LightUiState {
    return new LightUiState(value, this.selectedState)
  }
}
