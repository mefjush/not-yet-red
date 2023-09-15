"use client"

import Image from 'next/image'
import LightComponent from './light'
import CrossingComponent from './crossing'

import { useState, useEffect } from 'react'

let wakeLock = null

export default function Home() {

  const [wakeLocked, setWakeLocked] = useState(false)

  const requestWakeLock = async () => {
    try {
      wakeLock = await navigator.wakeLock.request();
      setWakeLocked(true)
    } catch (err) {
      console.error(`${err.name}, ${err.message}`)
    }
  };

  // Function that attempts to release the wake lock.
  const releaseWakeLock = async () => {
    if (!wakeLock) {
      return
    }
    try {
      await wakeLock.release()
      setWakeLocked(false)
      wakeLock = null
    } catch (err) {
      console.error(`${err.name}, ${err.message}`)
    }
  }

  const toggleWakeLock = async (e) => {
    if (wakeLocked) {
      releaseWakeLock()
    } else {
      requestWakeLock()
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <h1 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Traffic Lights</h1>
      <div className="relative flex gap-x-3">
        <div className="flex h-6 items-center">
          <input type="checkbox" id="control-wakelock" name="Wake-lock" value="wakelock" checked={wakeLocked} onChange={(e) => toggleWakeLock(e)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
        </div>
        <div className="text-sm leading-6">
          <label htmlFor="control-wakelock" className="font-medium text-gray-900">Keep my screen on</label>
        </div>
      </div>


      <CrossingComponent time={Date.now()}/>
    </main>
  )
}

