"use client"

import { useState } from 'react'

interface ChangeEvent {
  target: {
    value: number
  }
}


export default function Input({id, label, min, max, step, value, onChange}: {id: string, label: string, min?: number, max?: number, step?: number, value: number, onChange: ((e: ChangeEvent) => void)}) {

  const toEvent = (val: any) => ({ target: { value: Number(val) }})

  const change = (e: ChangeEvent) => {
    if (max) {
      e.target.value = Math.min(e.target.value, max)
    }
    if (min || min == 0) {
      e.target.value = Math.max(e.target.value, min)
    }
    if (step && step < 1) {
      e.target.value = Math.round(e.target.value * 100) / 100
    }
    onChange(e)
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium leading-6 text-gray-900">{label}</label>
      <div className="grid grid-cols-1 sm:grid-cols-6">
        <div className="sm:col-span-4">
          <input id={id} type="number" min={min} max={max} value={value} onChange={(e) => change(toEvent(e.target.value))} className="block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
        </div>
        <div className="sm:col-span-1 pl-2">
          <button type="button" onClick={ () => change(toEvent(value + (step || 1))) } className="block w-full flex justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">+</button>
        </div>
        <div className="sm:col-span-1 pl-2">
          <button type="button" onClick={ () => change(toEvent(value - (step || 1))) } className="block w-full flex justify-center rounded-md bg-indigo-400 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">-</button>
        </div>
      </div>
    </div>
  )
}
