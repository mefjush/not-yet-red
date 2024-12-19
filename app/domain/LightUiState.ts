import { State } from "./State"

export default class LightUiState {

  selectedState: State

  constructor(selectedState: State) {
    this.selectedState = selectedState
  }

  withSelectedState(state: State): LightUiState {
    return new LightUiState(state)
  }
}
