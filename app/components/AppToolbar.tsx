import { AppBar, Toolbar } from "@mui/material"

export default function AppToolbar({ children }: { children: React.ReactNode }) {
  return (
    <AppBar position="sticky">
      <Toolbar sx={{ gap: 1 }}>{children}</Toolbar>
    </AppBar>
  )
}
