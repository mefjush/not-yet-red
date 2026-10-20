"use client"

import {
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material"
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined"
import SmartphoneIcon from "@mui/icons-material/Smartphone"
import TrafficLight from "../domain/TrafficLight"
import useTimestamp from "../hooks/useTimestamp"
import Scene from "./Scene"
import { SCENARIOS, scenarioUrl } from "./scenarios"

const LIGHTS = SCENARIOS.flatMap((scenario) =>
  scenario.config.flat().map((lightConfig) => new TrafficLight(lightConfig, false)),
)

export default function ScenarioList() {
  const timestamp = useTimestamp(LIGHTS)

  return (
    <Grid container spacing={2}>
      {SCENARIOS.map((scenario) => {
        const phones = scenario.layout == "manual" ? 1 : scenario.config.length
        return (
          <Grid key={scenario.name} size={{ xs: 12, sm: 6 }}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Scene layout={scenario.layout} config={scenario.config} timestamp={timestamp} />
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 2, mb: 0.5 }}>
                  <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
                    {scenario.name}
                  </Typography>
                  <Chip
                    size="small"
                    icon={<SmartphoneIcon />}
                    label={`${phones} phone${phones > 1 ? "s" : ""}`}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {scenario.description}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start", mt: 1 }}>
                  <PlaceOutlinedIcon fontSize="small" color="action" />
                  <Typography variant="body2">{scenario.setup}</Typography>
                </Stack>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button variant="contained" href={scenarioUrl(scenario.config)}>
                  Use this setup
                </Button>
              </CardActions>
            </Card>
          </Grid>
        )
      })}
    </Grid>
  )
}
