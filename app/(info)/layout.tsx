"use client"

import { AppBar, Paper, Stack, Toolbar, Typography } from "@mui/material"
import BackButton from "../components/BackButton"
import { useSelectedLayoutSegment } from 'next/navigation'

export default function InfoLayout({
    children,
  }: {
    children: React.ReactNode,
  }) {

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
        <AppBar position="fixed">
          <Toolbar>{toolbarElements}</Toolbar>
        </AppBar>
        <Toolbar />
        <Paper sx={{ p: 2, m: 2 }}>
          {children}
        </Paper>
      </>
    )
  }

