import "./globals.css"
import { Box, Button, Container, IconButton, Stack, Typography } from "@mui/material"
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter"
import type { Metadata, Viewport } from "next"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import GitHubIcon from "@mui/icons-material/GitHub"
import ThemeClient from "./ThemeClient"
import { MENU_ITEMS } from "./components/MenuItems"

export const metadata: Metadata = {
  title: "Not Yet Red",
  description: "Change your smartphone into a traffic light!",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1113" },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppRouterCacheProvider>
          <ThemeClient>
            <NuqsAdapter>
              {children}
              <Container component="footer" maxWidth="sm" sx={{ py: 4, textAlign: "center" }}>
                <Stack direction="row" spacing={1} sx={{ justifyContent: "center", mb: 1 }}>
                  {MENU_ITEMS.map((item) => (
                    <Button key={item.name} href={item.href} color="inherit" size="small">
                      {item.name}
                    </Button>
                  ))}
                  <IconButton
                    size="small"
                    href="https://github.com/mefjush/not-yet-red"
                    aria-label="Source code on GitHub"
                  >
                    <GitHubIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  <b>Not Yet Red</b> turns any space into a traffic playground using smartphones as
                  traffic lights. Fun, interactive, and perfect for kids to learn road rules while
                  playing! 🚦
                </Typography>
                <Box sx={{ mt: 1, typography: "caption", color: "text.disabled" }}>
                  © {new Date().getFullYear()} Not Yet Red by mefju
                </Box>
              </Container>
            </NuqsAdapter>
          </ThemeClient>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
