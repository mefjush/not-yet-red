"use client"

import { Paper, Stack, Typography } from "@mui/material"
import BackButton from "../components/BackButton"
import { useSelectedLayoutSegment } from "next/navigation"
import AppToolbar from "../components/AppToolbar"

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment()

  const toolbarElements = (
    <>
      <Stack direction="row" display={"flex"} sx={{ alignItems: "center" }}>
        <BackButton />
        <Typography variant="h6" component="div" noWrap>
          {(segment?.charAt(0)?.toUpperCase() || "") + segment?.slice(1)}
        </Typography>
      </Stack>
    </>
  )

  return (
    <>
      <AppToolbar>{toolbarElements}</AppToolbar>
      <Paper sx={{ p: 2, m: 2 }}>{children}</Paper>
    </>
  )
}
