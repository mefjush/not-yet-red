import './globals.css'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import type { Metadata, Viewport } from 'next'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export const metadata: Metadata = {
  title: 'Traffic Lights',
  description: 'Change your smartphone into a traffic light!',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body><NuqsAdapter>{children}</NuqsAdapter></body>
    </html>
  )
}
