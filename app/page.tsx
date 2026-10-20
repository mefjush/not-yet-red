"use client"

import { Box, Button, Container, Grid, Paper, Stack, Typography } from "@mui/material"
import TuneIcon from "@mui/icons-material/Tune"
import QrCode2Icon from "@mui/icons-material/QrCode2"
import FullscreenIcon from "@mui/icons-material/Fullscreen"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import { useEffect } from "react"
import AppToolbar from "./components/AppToolbar"
import AnimatedLogo from "./components/AnimatedLogo"
import Scene from "./components/Scene"
import ScenarioList from "./components/ScenarioList"
import { SCENARIOS } from "./components/scenarios"
import TrafficLight from "./domain/TrafficLight"
import useTimestamp from "./hooks/useTimestamp"

const HERO = SCENARIOS.find((scenario) => scenario.layout == "tJunction")!
const HERO_LIGHTS = HERO.config.flat().map((lightConfig) => new TrafficLight(lightConfig, false))

const STEPS = [
  {
    icon: <TuneIcon />,
    title: "Build your intersection",
    text: "Pick the lights you need and how long each one stays green.",
  },
  {
    icon: <QrCode2Icon />,
    title: "Open it on every phone",
    text: "Scan the QR code with the other phones. Nothing to install.",
  },
  {
    icon: <FullscreenIcon />,
    title: "Place the phones and play",
    text: "Go fullscreen and stand each phone by its road. They switch in sync, even offline.",
  },
]

export default function Home() {
  const timestamp = useTimestamp(HERO_LIGHTS)

  // the installed app goes straight to the tool
  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      window.location.replace("/intersection")
    }
  }, [])

  return (
    <main>
      <AppToolbar>
        <AnimatedLogo />
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" href="/intersection">
          Open the app
        </Button>
      </AppToolbar>

      <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6 } }}>
        <Grid container spacing={4} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontWeight: 800, fontSize: { xs: "2.2rem", sm: "3rem" } }}
              gutterBottom
            >
              Turn your phones into traffic lights
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, mb: 3 }}>
              Each phone becomes one traffic light, all switching in sync. Build a crossing in your
              hallway, garden or toy car city, then see who makes it before the red.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                variant="contained"
                size="large"
                href="/intersection"
                endIcon={<ArrowForwardIcon />}
              >
                Start building
              </Button>
              <Button variant="outlined" size="large" href="#setups">
                Browse setups
              </Button>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Scene layout={HERO.layout} config={HERO.config} timestamp={timestamp} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, px: 0.5 }}>
                A T-junction with three phones. Phone 3 shows two turn arrows side by side.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mt: { xs: 6, sm: 8 }, mb: 2 }}
        >
          How it works
        </Typography>
        <Grid container spacing={2}>
          {STEPS.map((step, idx) => (
            <Grid key={step.title} size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 2.5, height: "100%" }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      p: 1,
                      borderRadius: 2,
                      bgcolor: "action.selected",
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Typography variant="overline" color="text.secondary">
                    Step {idx + 1}
                  </Typography>
                </Stack>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
                  {step.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.text}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Typography
          id="setups"
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mt: { xs: 6, sm: 8 }, mb: 0.5, scrollMarginTop: 80 }}
        >
          Ready-made setups
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Each sketch shows where to put the phones. Pick one and tweak it as you like.
        </Typography>
        <ScenarioList />

        <Box
          component="section"
          aria-labelledby="story"
          sx={{ mt: { xs: 6, sm: 8 }, mx: "auto", maxWidth: 600, textAlign: "center" }}
        >
          <Typography id="story" variant="h6" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
            Why &quot;Not Yet Red&quot;?
          </Typography>
          <Typography color="text.secondary">
            It started with my five-year-old son, whose toy cars kept getting stuck in traffic jams.
            I built him a traffic light, and soon the whole house was playing: hallway crossings,
            backyard bike rides, and the big thrill of making it through <i>just</i> before the
            light turns red. Push on or stop? That split second gave the app its name, usually right
            before the dad-police chase begins.
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, fontStyle: "italic" }}>
            — mefju
          </Typography>
        </Box>
      </Container>
    </main>
  )
}
