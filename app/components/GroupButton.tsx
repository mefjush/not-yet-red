import { Box, Button, SxProps, Theme } from "@mui/material"
import CompressIcon from "@mui/icons-material/Compress"
import ExpandIcon from "@mui/icons-material/Expand"

export default function GroupButton({
  grouped,
  onClick,
  sx = []
}: {
  grouped: boolean
  onClick: () => void,
  sx: SxProps<Theme>
}) {
  return (
    <Box
      sx={[
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Button
        onClick={onClick}
        startIcon={grouped ? <CompressIcon /> : <ExpandIcon />}
      >
        { grouped ? "Group" : "Split" }
      </Button>
    </Box>
  )
}
