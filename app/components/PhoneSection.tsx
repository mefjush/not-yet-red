import { Box, Button, Stack, Typography } from "@mui/material"
import SmartphoneIcon from "@mui/icons-material/Smartphone"
import AddIcon from "@mui/icons-material/Add"

export default function PhoneSection({
  index,
  onAddLight,
  children,
}: {
  index: number
  onAddLight: () => void
  children: React.ReactNode
}) {
  return (
    <Box
      component="section"
      aria-label={`Phone ${index + 1}`}
      sx={{ bgcolor: "action.hover", borderRadius: "20px", p: { xs: 1, sm: 1.5 } }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", px: 1, pt: 0.5, pb: 1 }}>
        <SmartphoneIcon fontSize="small" color="action" />
        <Typography sx={{ fontWeight: 600, flexGrow: 1 }}>Phone {index + 1}</Typography>
        <Button size="small" color="inherit" startIcon={<AddIcon />} onClick={onAddLight}>
          Add light here
        </Button>
      </Stack>
      <Stack spacing={1}>{children}</Stack>
    </Box>
  )
}
