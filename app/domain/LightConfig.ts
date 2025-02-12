import { State, STATE_ATTRIBUTES, StateAttributes } from "./State"
import IntersectionSettings from "./IntersectionSettings"
import { negativeSafeMod } from "../utils"
import { PresetId } from "./Preset"
import { Preset, PRESETS } from "./Preset"

const DEFAULT_NEW_PHASE_DURATION = 2_000

export class TimeRange {
  constructor(
    public start: number,
    public end: number,
    private cycleLength: number,
  ) {}

  inverted(): boolean {
    return this.end < this.start
  }

  duration(): number {
    if (!this.inverted()) {
      return this.end - this.start
    } else {
      return this.cycleLength - this.start + this.end
    }
  }
}

export class Phase {
  state: State
  duration: number

  constructor(state: State, duration: number) {
    this.state = state
    this.duration = duration
  }

  stateAttributes(): StateAttributes {
    return STATE_ATTRIBUTES[this.state]
  }
}

export interface LightSettings {
  offset: number
  phases: Phase[]
  presetId: PresetId
}

const sortByOrder = (a: Phase, b: Phase) =>
  a.stateAttributes().order - b.stateAttributes().order
const sortByPriority = (a: Phase, b: Phase) =>
  a.stateAttributes().priority - b.stateAttributes().priority

export default class LightConfig {
  intersectionSettings: IntersectionSettings
  offset: number
  phases: Phase[]
  preset: Preset

  constructor(
    intersectionSettings: IntersectionSettings,
    lightSettings: LightSettings,
  ) {
    this.intersectionSettings = intersectionSettings
    this.offset = lightSettings.offset
    this.phases = this.rescale(intersectionSettings, lightSettings).phases
    this.preset = PRESETS[lightSettings.presetId]
  }

  withOffset(offset: number): LightSettings {
    const roundedOffset = Math.round(offset / 1000) * 1000
    return {
      offset: roundedOffset,
      phases: this.phases,
      presetId: this.preset.presetId,
    }
  }

  withPreset(presetId: PresetId): LightSettings {
    const preset = PRESETS[presetId]
    const newPhases = preset.states.map(
      (state) =>
        this.phases.find((phase) => phase.state == state) ||
        new Phase(state, DEFAULT_NEW_PHASE_DURATION),
    )
    return { offset: this.offset, phases: newPhases, presetId: presetId }
  }

  toLightSettings(): LightSettings {
    return {
      offset: this.offset,
      phases: this.phases,
      presetId: this.preset.presetId,
    }
  }

  cycleLength() {
    return this.intersectionSettings.cycleLength
  }

  isFixable(phase: Phase): boolean {
    return phase.stateAttributes().priority >= 3
  }

  roundSeconds(duration: number): number {
    return Math.round(duration / 1000) * 1000
  }

  rescale(
    intersectionSettings: IntersectionSettings,
    lightSettings: LightSettings,
  ): LightSettings {
    const phasesLength = lightSettings.phases.reduce(
      (acc, phase) => acc + phase.duration,
      0,
    )
    const diff = intersectionSettings.cycleLength - phasesLength

    if (Math.abs(diff) == 0) {
      return lightSettings
    }

    const fixableCount = lightSettings.phases.filter(this.isFixable).length
    const diffPerPhase = this.roundSeconds(diff / fixableCount)
    let diffRemainder = diff

    let fixedPhases = lightSettings.phases.toSorted(
      (a, b) => b.duration - a.duration,
    )

    const fixStrategies = [
      { precondition: this.isFixable, applicableDiff: () => diffPerPhase },
      { precondition: this.isFixable, applicableDiff: () => diffRemainder },
      { precondition: (p: Phase) => true, applicableDiff: () => diffRemainder },
    ]

    for (
      let i = 0;
      i < fixStrategies.length && Math.abs(diffRemainder) != 0;
      i++
    ) {
      const strategy = fixStrategies[i]
      fixedPhases = fixedPhases.map((phase) => {
        if (!strategy.precondition(phase)) {
          return phase
        }
        const applicableDiff = Math.max(
          strategy.applicableDiff(),
          -phase.duration,
        )
        diffRemainder -= applicableDiff
        return new Phase(phase.state, phase.duration + applicableDiff)
      })
    }

    return { ...lightSettings, phases: fixedPhases.toSorted(sortByOrder) }
  }

  withStateDuration(state: State, newDuration: number): LightSettings {
    const calculateStateOffset = (phases: Phase[]) => {
      const stateIndex = this.phases.findIndex((p) => p.state == state)
      return phases
        .filter((phase, idx) => idx < stateIndex)
        .reduce((acc, phase) => acc + phase.duration, 0)
    }

    const remainingPhases = this.phases
      .filter((p) => p.state != state)
      .toSorted(sortByPriority)
      .reverse()
    const fixablePhases = remainingPhases.filter(this.isFixable)
    const unfixablePhases = remainingPhases.filter((p) => !this.isFixable(p))

    const oldDuration = this.phases.find((p) => p.state == state)?.duration || 0
    let diff = oldDuration - newDuration

    const fixedRemaining = []

    for (let p of fixablePhases) {
      const durationBeforeFix = p.duration
      fixedRemaining.push(new Phase(p.state, Math.max(0, p.duration + diff)))
      if (diff < 0 && durationBeforeFix < Math.abs(diff)) {
        diff = diff + durationBeforeFix
      } else {
        diff = 0
      }
    }

    fixedRemaining.push(new Phase(state, newDuration + diff))

    const newPhases = fixedRemaining
      .concat(unfixablePhases)
      .toSorted(sortByOrder)

    const offsetDiff =
      calculateStateOffset(this.phases) - calculateStateOffset(newPhases)

    return {
      offset: negativeSafeMod(this.offset + offsetDiff, this.cycleLength()),
      phases: newPhases,
      presetId: this.preset.presetId,
    }
  }

  getTimeRange(state: State): TimeRange {
    const selectedPhaseIndex = this.phases.findIndex(
      (phase) => phase.state == state,
    )
    const start =
      this.offset +
      this.phases
        .slice(0, selectedPhaseIndex)
        .map((phase) => phase.duration)
        .reduce((sum, current) => sum + current, 0)
    const end = start + this.phases[selectedPhaseIndex].duration
    const cycleLength = this.cycleLength()
    return new TimeRange(start % cycleLength, end % cycleLength, cycleLength)
  }

  withStateTimeRange(state: State, newTimeRange: TimeRange): LightSettings {
    const currentTimeRange = this.getTimeRange(state)

    const selectedPhaseIndex = this.phases.findIndex(
      (phase) => phase.state == state,
    )
    const withNewDuration = this.withStateDuration(
      state,
      newTimeRange.duration(),
    )

    const phaseStart = withNewDuration.phases
      .slice(0, selectedPhaseIndex)
      .map((phase) => phase.duration)
      .reduce((sum, current) => sum + current, 0)

    const adjustToRangeStart = currentTimeRange.start != newTimeRange.start

    const finalOffset = adjustToRangeStart
      ? newTimeRange.start - phaseStart
      : newTimeRange.end -
        (phaseStart + withNewDuration.phases[selectedPhaseIndex].duration)
    return {
      ...withNewDuration,
      offset: negativeSafeMod(finalOffset, this.cycleLength()),
    }
  }

  includesState(state: State): boolean {
    return this.phases.map((p) => p.state).includes(state)
  }
}

export const DEFAULT_LIGHT_SETTINGS: LightSettings = {
  offset: 0,
  phases: [
    new Phase(State.RED, 16_000),
    new Phase(State.RED_YELLOW, 2_000),
    new Phase(State.GREEN, 10_000),
    new Phase(State.YELLOW, 2_000),
  ],
  presetId: PresetId.FOUR_PHASE,
}

export const TEST_LIGHT_SETTINGS: LightSettings = {
  ...DEFAULT_LIGHT_SETTINGS,
  phases: [
    new Phase(State.RED, 30_000),
    new Phase(State.RED_YELLOW, 2_000),
    new Phase(State.GREEN, 26_000),
    new Phase(State.YELLOW, 2_000),
  ],
}

export const MAXED_OUT_TEST_LIGHT_SETTINGS: LightSettings = {
  ...DEFAULT_LIGHT_SETTINGS,
  offset: 10_000,
  phases: [
    new Phase(State.RED, 56_000),
    new Phase(State.RED_YELLOW, 2_000),
    new Phase(State.GREEN, 0),
    new Phase(State.YELLOW, 2_000),
  ],
}

export const CONDITIONAL_RIGHT_TEST_LIGHT_SETTINGS: LightSettings = {
  offset: 0,
  phases: [new Phase(State.GREEN, 10_000), new Phase(State.NONE, 50_000)],
  presetId: PresetId.CONDITIONAL_RIGHT,
}
