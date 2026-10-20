import { useEffect, useRef } from "react"
import { State } from "../domain/State"
import TrafficLight from "../domain/TrafficLight"
import { Preset, PresetId, SymbolId } from "../domain/Preset"

// Pedestrian crossings follow the Polish acoustic signal rules: 880 Hz beeps of 18-20 ms, repeated
// every 1000 ms on red (stop), 200 ms on green (go) and 100 ms on flashing green (hurry up).
// Railway crossings ring a bell while the red lights flash.
const BEEP_FREQUENCY = 880
const BEEP = 0.02
const VOLUME = 0.2
// ponytail: no official tempo found for the crossing bell; tune by ear
const BELL_EVERY = 500

type Sound = "beep" | "bell"
const SOUNDS: Partial<Record<State, { every: number; sound: Sound }>> = {
  [State.RED]: { every: 1000, sound: "beep" }, // stop
  [State.GREEN]: { every: 200, sound: "beep" }, // go
  [State.GREEN_FLASHING]: { every: 100, sound: "beep" }, // hurry up
  [State.RED_ALTERNATING]: { every: BELL_EVERY, sound: "bell" }, // train coming
}

// lights that make crossing sounds: pedestrian lights and railway crossings
export const hasCrossingSound = (preset: Preset) =>
  preset.symbolId == SymbolId.PEDESTRIAN || preset.presetId == PresetId.RAILWAY
// a beep woken up later than this (e.g. the phone stalled) is skipped rather than played late
const LATE_LIMIT = 50

let audio: AudioContext | null = null

// browsers only allow sound after a user gesture: call this from a tap to unlock it
export const unlockAudio = () => {
  audio ??= new AudioContext()
  audio.resume()
}

function tone(frequency: number, type: OscillatorType, volume: number, length: number) {
  if (!audio || audio.state != "running") return
  const t = audio.currentTime
  const oscillator = audio.createOscillator()
  const gain = audio.createGain()
  oscillator.type = type
  oscillator.frequency.value = frequency
  // quick fade in, then fade out over the tone's length so it doesn't pop
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.002)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length)
  oscillator.connect(gain).connect(audio.destination)
  oscillator.start(t)
  oscillator.stop(t + length + 0.01)
}

const play = (sound: Sound) => {
  if (sound == "beep") {
    tone(BEEP_FREQUENCY, "square", VOLUME, BEEP)
  } else {
    // a bell strike: a few inharmonic partials that ring out
    tone(1150, "sine", VOLUME, 0.45)
    tone(2760, "sine", VOLUME * 0.5, 0.3)
    tone(4100, "sine", VOLUME * 0.25, 0.15)
  }
}

// how often to sound in this state, or null for silence (e.g. a broken-down light)
export const soundInterval = (state: State): number | null => SOUNDS[state]?.every ?? null

// one wake-up of the beep loop at synced time t: beep slots start at each phase start and
// repeat every interval; lastSlot is the slot beeped last, so no slot ever beeps twice
export function beepStep(light: TrafficLight, t: number, lastSlot: number) {
  const end = light.nextStateTimestamp(t)
  const phase = light.currentPhase(t)
  const every = soundInterval(phase.state)
  if (every == null) return { beep: false, sound: undefined, slot: lastSlot, wakeAt: end }

  const start = end - phase.duration
  const slot = start + Math.floor((t - start) / every) * every
  const beep = slot > lastSlot && t - slot < LATE_LIMIT
  return {
    beep,
    sound: SOUNDS[phase.state]!.sound,
    slot: beep ? slot : lastSlot,
    wakeAt: Math.min(slot + every, end),
  }
}

// sounds like a pedestrian or railway crossing for the given light; no light keeps quiet.
// Runs its own loop on the synced clock, independent of re-renders, so the rhythm stays steady.
export default function useCrossingSound(light: TrafficLight | undefined, timeCorrection: number) {
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
      if (step.beep) play(step.sound!)
      lastSlot = step.slot
      timer = setTimeout(loop, Math.max(0, step.wakeAt - t))
    }

    loop()
    return () => clearTimeout(timer)
  }, [enabled, timeCorrection])
}
