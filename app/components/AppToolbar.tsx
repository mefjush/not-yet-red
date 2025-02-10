import { AppBar, Toolbar } from "@mui/material"

export default function AppToolbar({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AppBar position="fixed">
        <Toolbar>{children}</Toolbar>
      </AppBar>
      <Toolbar />
    </>
  )
}
