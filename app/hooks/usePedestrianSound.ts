import { useEffect, useRef } from "react"
import { State } from "../domain/State"
import TrafficLight from "../domain/TrafficLight"

// Polish acoustic crossing signals: 880 Hz beeps of 18-20 ms, repeated
// every 1000 ms on red (stop), 200 ms on green (go) and 100 ms on flashing green (hurry up)
const FREQUENCY = 880
const BEEP = 0.02
const VOLUME = 0.2
const BEEP_EVERY: Partial<Record<State, number>> = {
  [State.RED]: 1000, // stop
  [State.GREEN]: 200, // go
  [State.GREEN_FLASHING]: 100, // hurry up
}
// a beep woken up later than this (e.g. the phone stalled) is skipped rather than played late
const LATE_LIMIT = 50

let audio: AudioContext | null = null

// browsers only allow sound after a user gesture: call this from a tap to unlock it
export const unlockAudio = () => {
  audio ??= new AudioContext()
  audio.resume()
}

function beep() {
  if (!audio || audio.state != "running") return
  const t = audio.currentTime
  const oscillator = audio.createOscillator()
  const gain = audio.createGain()
  oscillator.type = "square"
  oscillator.frequency.value = FREQUENCY
  // quick fade in and out so it doesn't pop
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(VOLUME, t + 0.002)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + BEEP)
  oscillator.connect(gain).connect(audio.destination)
  oscillator.start(t)
  oscillator.stop(t + BEEP + 0.01)
}

// how often to beep in this state, or null for silence (e.g. a broken-down light)
export const beepInterval = (state: State): number | null => BEEP_EVERY[state] ?? null

// one wake-up of the beep loop at synced time t: beep slots start at each phase start and
// repeat every interval; lastSlot is the slot beeped last, so no slot ever beeps twice
export function beepStep(light: TrafficLight, t: number, lastSlot: number) {
  const end = light.nextStateTimestamp(t)
  const phase = light.currentPhase(t)
  const every = beepInterval(phase.state)
  if (every == null) return { beep: false, slot: lastSlot, wakeAt: end }

  const start = end - phase.duration
  const slot = start + Math.floor((t - start) / every) * every
  const beep = slot > lastSlot && t - slot < LATE_LIMIT
  return { beep, slot: beep ? slot : lastSlot, wakeAt: Math.min(slot + every, end) }
}

// beeps like a pedestrian crossing for the given light; no light keeps quiet.
// Runs its own loop on the synced clock, independent of re-renders, so the rhythm stays steady.
export default function usePedestrianSound(
  light: TrafficLight | undefined,
  timeCorrection: number,
) {
  const lightRef = useRef(light)
  useEffect(() => {
    lightRef.current = light
  })

  const enabled = light != undefined

  useEffect(() => {
    if (!enabled) return
    let lastSlot = -Infinity
    let timer: ReturnType<typeof setTimeout>

    const loop = () => {
      if (!lightRef.current) return
      const t = Date.now() - timeCorrection
      const step = beepStep(lightRef.current, t, lastSlot)
      if (step.beep) beep()
      lastSlot = step.slot
      timer = setTimeout(loop, Math.max(0, step.wakeAt - t))
    }

    loop()
    return () => clearTimeout(timer)
  }, [enabled, timeCorrection])
}
