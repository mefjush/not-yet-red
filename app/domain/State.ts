export enum State {
  RED = "RED",
  RED_YELLOW = "RED_YELLOW",
  GREEN = "GREEN",
  YELLOW = "YELLOW",
  NONE = "NONE"
}

export type SegmentColor = 'tlRed' | 'tlGreen' | 'tlYellow' 

export type TrafficLightColors = SegmentColor | 'tlOrange' | 'tlGrey'

export interface StateAttributes {
  name: string,
  priority: number,
  order: number,
  color: TrafficLightColors
  segments: SegmentColor[]
}

export const STATE_ATTRIBUTES: { [id: string] : StateAttributes } = {
  RED: { "name": "Red", "color": "tlRed", priority: 3, order: 1, segments: ['tlRed'] },
  RED_YELLOW: { "name": "Red-Yellow", "color": "tlOrange", priority: 2, order: 2, segments: ['tlRed', 'tlYellow'] },
  GREEN: { "name": "Green", "color": "tlGreen", priority: 4, order: 3, segments: ['tlGreen'] },
  YELLOW: { "name": "Yellow", "color": "tlYellow", priority: 1, order: 4, segments: ['tlYellow'] },
  NONE: { "name": "None", "color": "tlGrey", priority: 0, order: 0, segments: [] },
}
