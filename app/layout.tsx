import './globals.css'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { Box, Button, IconButton, Stack } from '@mui/material'
import type { Metadata, Viewport } from 'next'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import TrafficIcon from '@mui/icons-material/Traffic'
import GitHubIcon from '@mui/icons-material/GitHub'
import ThemeClient from './ThemeClient'
import { MENU_ITEMS } from './components/MenuItems'

export const metadata: Metadata = {
  title: 'Not Yet Red',
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
        <ThemeClient>
          <NuqsAdapter>
            {children}
            <Stack spacing={1} sx={{ pt: 1, pb: 2, m: 1 }}>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <IconButton size="large" edge="start" href="/">
                  <TrafficIcon />
                </IconButton> 
                <p>2025 <strong>Not Yet Red</strong> by mefju</p>
                <IconButton size="large" edge="end" href="https://github.com/mefjush/not-yet-red">
                  <GitHubIcon />
                </IconButton>
              </Box>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                { MENU_ITEMS.map((item) => (
                  <Button key={item.name} href={item.href}>{item.name}</Button>
                ))}
              </Box>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <p style={{ textAlign: 'center' }}>
                  <b>Not Yet Red</b> turns any space into a traffic playground using smartphones as traffic lights. 
                  <br />  
                  Fun, interactive, and perfect for kids to learn road rules while playing! 🚦😊
                </p>
              </Box>
            </Stack>
          </NuqsAdapter>
        </ThemeClient>
      </body>
    </html>
  )
}
