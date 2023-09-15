"use client"

import { useState } from 'react'

import Input from './input'

export default function LightComponent({ index, currentTimestamp, light, lightSettings, onLightSettingsChange, onClone, onDelete }) {

  const offsetId =`light-${index}-offset`
  const redDurationId =`light-${index}-red-duration`

  return (
    <div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <h3 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Light #{index}</h3>
        <form className="space-y-4">
          <button type="button" onClick={() => onClone()} className="justify-center rounded-md bg-indigo-600 mr-2 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">📋 Duplicate</button>
          <button type="button" disabled={onDelete == null} onClick={() => onDelete()} className="justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 disabled:bg-red-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">❌ Delete</button>
          <Input label="Offset duration" id={offsetId} min={0} value={lightSettings.offset / 1000} onChange={e => onLightSettingsChange({ ...lightSettings, offset: e.target.value * 1000 })} />
          <Input label="Red duration" id={redDurationId} min={2} value={lightSettings.duration.red / 1000} onChange={e => onLightSettingsChange({ ...lightSettings, duration: { ...lightSettings.duration, red: e.target.value * 1000 } })} />
        </form>
      </div>
      <img src={light.currentPhase(currentTimestamp).state.file}/>
    </div>
  )
}
