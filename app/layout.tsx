import './globals.css'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { Box, IconButton, Stack } from '@mui/material'
import type { Metadata, Viewport } from 'next'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import TrafficIcon from '@mui/icons-material/Traffic'
import GitHubIcon from '@mui/icons-material/GitHub'

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
      <body>
        <NuqsAdapter>
          {children}
          <Stack spacing={2} sx={{ p: 1, m: 1 }}>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <IconButton size="large" edge="start" href="/">
                <TrafficIcon />
              </IconButton> 
              <p>2025 <strong>Traffic Lights</strong> by mefju</p>
              <IconButton size="large" edge="end" href="https://github.com/mefjush/mefjush.github.io">
                <GitHubIcon />
              </IconButton>
            </Box>
          </Stack>
        </NuqsAdapter>
      </body>
    </html>
  )
}
