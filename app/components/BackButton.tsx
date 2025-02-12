import { IconButton } from "@mui/material"
import { useRouter } from "next/navigation"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"

export default function BackButton() {
  const router = useRouter()

  return (
    <IconButton edge="start" size="large" sx={{ color: "white" }} onClick={() => router.back()}>
      <ArrowBackIcon />
    </IconButton>
  )
}
