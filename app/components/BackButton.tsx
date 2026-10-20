import { IconButton } from "@mui/material"
import { useRouter } from "next/navigation"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"

export default function BackButton({ onClick }: { onClick?: () => void }) {
  const router = useRouter()

  return (
    <IconButton
      edge="start"
      size="large"
      aria-label="Back"
      onClick={onClick ?? (() => router.back())}
    >
      <ArrowBackIcon />
    </IconButton>
  )
}
