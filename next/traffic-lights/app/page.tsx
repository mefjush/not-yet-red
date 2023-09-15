import Image from 'next/image'
import LightComponent from './light'
import CrossingComponent from './crossing'


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <CrossingComponent time={Date.now()}/>
    </main>
  )
}
