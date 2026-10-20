import { Link, Stack, Typography } from "@mui/material"
import TrafficIcon from "@mui/icons-material/Traffic"

export default function AnimatedLogo() {
  return (
    <Link href="/" color="inherit" underline="none" className="logo" aria-label="Not Yet Red home">
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <TrafficIcon />
        <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
          <span className="logo-green">Not</span>.<span className="logo-yellow">Yet</span>.
          <span className="logo-red">Red</span>
        </Typography>
      </Stack>
    </Link>
  )
}
