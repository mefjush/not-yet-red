"use client"

import { createTheme, CssBaseline, ThemeProvider } from "@mui/material"
import { orange, green, yellow, red, grey, lightGreen } from "@mui/material/colors"

//https://mui.com/material-ui/customization/palette/
declare module "@mui/material/styles" {
  interface Palette {
    tlRed: Palette["primary"]
    tlYellow: Palette["primary"]
    tlOrange: Palette["primary"]
    tlGreen: Palette["primary"]
    tlGrey: Palette["primary"]
    tlLightGreen: Palette["primary"]
    tlWhite: Palette["primary"]
  }
  interface PaletteOptions {
    tlRed: Palette["primary"]
    tlYellow: Palette["primary"]
    tlOrange: Palette["primary"]
    tlGreen: Palette["primary"]
    tlGrey: Palette["primary"]
    tlLightGreen: Palette["primary"]
    tlWhite: Palette["primary"]
  }
}

type TlColors = {
  tlRed: true
  tlYellow: true
  tlOrange: true
  tlGreen: true
  tlGrey: true
  tlLightGreen: true
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides extends TlColors {}
}
declare module "@mui/material/Slider" {
  interface SliderPropsColorOverrides extends TlColors {}
}
declare module "@mui/material/Radio" {
  interface RadioPropsColorOverrides extends TlColors {}
}
declare module "@mui/material/Chip" {
  interface ChipPropsColorOverrides extends TlColors {}
}

const { palette } = createTheme()

const trafficColors = {
  tlRed: palette.augmentColor({ color: red }),
  tlYellow: palette.augmentColor({ color: yellow }),
  tlOrange: palette.augmentColor({ color: orange }),
  tlGreen: palette.augmentColor({ color: green }),
  tlGrey: palette.augmentColor({ color: grey }),
  tlLightGreen: palette.augmentColor({ color: lightGreen }),
  // tram signal lamps
  tlWhite: palette.augmentColor({ color: { main: "#f4f4f0" } }),
}

const theme = createTheme({
  cssVariables: { colorSchemeSelector: "media" },
  colorSchemes: {
    light: {
      palette: {
        ...trafficColors,
        primary: { main: "#1f2328" },
        background: { default: "#f4f5f7", paper: "#ffffff" },
      },
    },
    dark: {
      palette: {
        ...trafficColors,
        primary: { main: "#e6e8eb" },
        background: { default: "#0f1113", paper: "#1a1d21" },
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCard: { defaultProps: { variant: "outlined" } },
    MuiPaper: { styleOverrides: { outlined: { borderRadius: 16 } } },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: "inherit" },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: `rgba(${theme.vars.palette.background.defaultChannel} / 0.8)`,
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${theme.vars.palette.divider}`,
        }),
      },
    },
    MuiFab: { styleOverrides: { root: { textTransform: "none", fontWeight: 600 } } },
    MuiTooltip: { defaultProps: { arrow: true } },
  },
})

export default function ThemeClient({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  )
}
