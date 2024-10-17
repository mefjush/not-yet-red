import { OverridableStringUnion } from '@mui/types'
import { ButtonPropsColorOverrides } from '@mui/material'

export enum State {
  RED = "RED",
  RED_YELLOW = "RED_YELLOW",
  GREEN = "GREEN",
  YELLOW = "YELLOW",
  NONE = "NONE"
}

export interface StateAttributes {
  name: string,
  file: string,
  priority: number,
  order: number,
  color: OverridableStringUnion<'inherit', ButtonPropsColorOverrides>
}

export const STATE_ATTRIBUTES: { [id: string] : StateAttributes } = {
  RED: { "name": "Red", "file": "img/red.png", "color": "tlRed", priority: 3, order: 1 },
  RED_YELLOW: { "name": "Red-Yellow", "file": "img/red-yellow.png", "color": "tlOrange", priority: 2, order: 2 },
  GREEN: { "name": "Green", "file": "img/green.png", "color": "tlGreen", priority: 4, order: 3 },
  YELLOW: { "name": "Yellow", "file": "img/yellow.png", "color": "tlYellow", priority: 1, order: 4 },
  NONE: { "name": "None", "file": "img/none.png", "color": "tlGrey", priority: 0, order: 0 },
}
