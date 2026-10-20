"use client"

import { Link, Paper, Typography } from "@mui/material"

export default function Privacy() {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 }, m: 2, mx: { md: "auto" }, maxWidth: 800 }}>
      <Typography variant="h4" gutterBottom>
        Privacy Policy
      </Typography>

      <Typography variant="body1" gutterBottom>
        <strong>Not Yet Red</strong> doesn&apos;t collect, store or share any personal data. There
        are no accounts, no analytics, no ads and no cookies.
      </Typography>

      <Typography variant="h5" sx={{ mt: 3 }} gutterBottom>
        Your intersection
      </Typography>
      <Typography variant="body1" gutterBottom>
        The lights you set up are saved only in the page address (URL). They leave your device only
        if you share that link yourself. The app keeps a copy of its own files on your device so it
        works offline.
      </Typography>

      <Typography variant="h5" sx={{ mt: 3 }} gutterBottom>
        Other services
      </Typography>
      <Typography variant="body1" gutterBottom>
        To keep phones in sync, the app asks <Link href="https://timeapi.io">timeapi.io</Link> for
        the current time when it starts. The website is hosted on GitHub Pages. Like any website,
        these services can see standard request details such as your IP address. Nothing about you
        or your intersection is sent to them.
      </Typography>

      <Typography variant="h5" sx={{ mt: 3 }} gutterBottom>
        Questions
      </Typography>
      <Typography variant="body1" gutterBottom>
        If you have any questions about this policy, you can{" "}
        <Link href="https://github.com/mefjush/not-yet-red/issues">open an issue on GitHub</Link>.
      </Typography>
    </Paper>
  )
}
