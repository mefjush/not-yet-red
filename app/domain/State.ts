export enum State {
  RED = "RED",
  RED_YELLOW = "RED_YELLOW",
  GREEN = "GREEN",
  GREEN_FLASHING = "GREEN_FLASHING",
  YELLOW = "YELLOW",
  NONE = "NONE",
}

export type SegmentColor = "tlRed" | "tlGreen" | "tlYellow"

export type TrafficLightColors = SegmentColor | "tlOrange" | "tlGrey" | "tlLightGreen"

export interface StateAttributes {
  name: string
  priority: number
  order: number
  color: TrafficLightColors
  segments: SegmentColor[]
  // the lit segments blink, e.g. a pedestrian light's last seconds of green
  flashing?: boolean
}

export const STATE_ATTRIBUTES: { [id: string]: StateAttributes } = {
  RED: {
    name: "Red",
    color: "tlRed",
    priority: 3,
    order: 1,
    segments: ["tlRed"],
  },
  RED_YELLOW: {
    name: "Red-Yellow",
    color: "tlOrange",
    priority: 2,
    order: 2,
    segments: ["tlRed", "tlYellow"],
  },
  GREEN: {
    name: "Green",
    color: "tlGreen",
    priority: 4,
    order: 3,
    segments: ["tlGreen"],
  },
  // transitional like yellow, so it keeps its length when other phases change
  GREEN_FLASHING: {
    name: "Flashing green",
    color: "tlLightGreen",
    priority: 1.5,
    order: 3.5,
    segments: ["tlGreen"],
    flashing: true,
  },
  YELLOW: {
    name: "Yellow",
    color: "tlYellow",
    priority: 1,
    order: 4,
    segments: ["tlYellow"],
  },
  NONE: { name: "None", color: "tlGrey", priority: 5, order: 0, segments: [] },
}
