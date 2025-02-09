import { IconButton, Link, Stack, Typography } from "@mui/material"
import TrafficIcon from "@mui/icons-material/Traffic"
import styled, { keyframes } from "styled-components"
import { green, yellow, red } from "@mui/material/colors"

export default function AnimatedLogo() {

  const colorFadeSpan = (phase: number) => {
    const colors = keyframes`
      ${0}%   { color: ${phase == 0 ? green[500] : "inherit"}; }
      ${5}%   { color: ${phase == 0 ? green[500] : "inherit"}; }
      ${6}%   { color: ${phase == 1 ? yellow[500] : "inherit"}; }
      ${11}%  { color: ${phase == 1 ? yellow[500] : "inherit"}; }
      ${12}%  { color: ${phase == 2 ? red[500] : "inherit"}; }
      ${99}%  { color: ${phase == 2 ? red[500] : "inherit"}; }
      ${100}% { color: ${phase == 0 ? green[500] : "inherit"}; }
    `
  
    return styled.span`
      animation: 25s ${colors} infinite linear;
    `
  }
  
  const FadeGreen = colorFadeSpan(0)
  const FadeYellow = colorFadeSpan(1)
  const FadeRed = colorFadeSpan(2)
  
  const HoverContainer = styled.div`
    &:hover {
      ${FadeGreen} {
        color: ${green[500]};
        animation: none;
      }
      ${FadeYellow} {
        color: ${yellow[500]};
        animation: none;
      }
      ${FadeRed} {
        color: ${red[500]};
        animation: none;
      }
    }
  `

  return (
    <Stack direction="row" display={"flex"} sx={{ alignItems: "center" }}>
      <IconButton size="large" edge="start" color="inherit" href="/">
        <TrafficIcon />
      </IconButton>
      <HoverContainer>
        <Typography
          variant="h6"
          noWrap
          component={Link}
          href="/"
          color="inherit"
          sx={{ textDecoration: "none" }}
        >
          <FadeGreen>Not</FadeGreen>.<FadeYellow>Yet</FadeYellow>.
          <FadeRed>Red</FadeRed>
        </Typography>
      </HoverContainer>
    </Stack>
  )
}
