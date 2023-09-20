import CrossingSettings from "./crossingSettings";
import LightSettings from "./lightSettings";

const DEFAULT_OFFSET = 0

interface State {
  name: string
  file: string
  color: string
}

interface Phase {
  state: State
  duration: number
}

const STATE = {
  RED: { "name": "Red", "file": "img/red.png", "color": "#FF0000"},
  RED_YELLOW: { "name": "Red-Yellow", "file": "img/red-yellow.png", "color": "#FFA500"},
  GREEN: { "name": "Green", "file": "img/green.png", "color": "#008000"},
  YELLOW: { "name": "Yellow", "file": "img/yellow.png", "color": "#FFFF00"},
  NONE: { "name": "None", "file": "img/none.png", "color": "#D3D3D3"},
};

function negativeSafeMod(n: number, m: number) {
  return ((n % m) + m) % m
}

const DEFAULT_PHASES = [
  { state: STATE.RED, duration: 5000 },
  { state: STATE.RED_YELLOW, duration: 2000 },
  { state: STATE.GREEN, duration: 5000 },
  { state: STATE.YELLOW, duration: 2000 }
];

const FAILURE_PHASES = [
  { state: STATE.YELLOW, duration: 2000 },
  { state: STATE.NONE, duration: 2000 }
];

const defaultPhases = (cycleLength: number, lightSettings: LightSettings) => {
  const DEFAULT_YELLOW_LENGTH = 2000
  const timeLeft = cycleLength - 2 * DEFAULT_YELLOW_LENGTH
  const red = Math.min(lightSettings.duration.red, timeLeft) || Math.floor(timeLeft / 2000) * 1000
  return [
    { state: STATE.RED, duration: red },
    { state: STATE.RED_YELLOW, duration: DEFAULT_YELLOW_LENGTH },
    { state: STATE.GREEN, duration: timeLeft - red },
    { state: STATE.YELLOW, duration: DEFAULT_YELLOW_LENGTH }
  ];
}



export default class TrafficLight {
  phases: Phase[]
  offset: number
  intervals: number[]
  cycleLength: number

  constructor(crossingSettings: CrossingSettings, lightSettings: LightSettings, failed: boolean) {
    this.phases = failed ? FAILURE_PHASES : defaultPhases(crossingSettings.cycleLength, lightSettings)
    this.offset = lightSettings.offset || DEFAULT_OFFSET
    this.intervals = this.phases.map(phase => phase.duration)
    this.cycleLength = this.intervals.reduce((sum, a) => sum + a, 0)
  }

  nextTransition(currentTimestamp: number) {
    const cycleStart = Math.floor((currentTimestamp - this.offset) / this.cycleLength) * this.cycleLength + this.offset
    let cycleTimestamp = cycleStart
    let phaseIdx = 0
    while (cycleTimestamp < currentTimestamp) {
      cycleTimestamp += this.intervals[phaseIdx]
      phaseIdx = (phaseIdx + 1) % this.intervals.length
    }
    return {
      phaseIdx: phaseIdx,
      timestamp: cycleTimestamp
    };
  }

  nextStateTimestamp(currentTimestamp: number) {
    return this.nextTransition(currentTimestamp).timestamp
  }

  currentPhase(currentTimestamp: number) {
    const state = negativeSafeMod(this.nextTransition(currentTimestamp).phaseIdx - 1, this.intervals.length)
    return this.phases[state]
  }
}
