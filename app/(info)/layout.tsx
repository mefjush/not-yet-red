"use client"

import { Typography } from "@mui/material"
import BackButton from "../components/BackButton"
import { useSelectedLayoutSegment } from "next/navigation"
import AppToolbar from "../components/AppToolbar"

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment()

  const toolbarElements = (
    <>
      <BackButton />
      <Typography variant="h6" component="div" noWrap>
        {(segment?.charAt(0)?.toUpperCase() || "") + segment?.slice(1)}
      </Typography>
    </>
  )

  return (
    <>
      <AppToolbar>{toolbarElements}</AppToolbar>
      {children}
    </>
  )
}
