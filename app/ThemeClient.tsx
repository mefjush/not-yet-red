"use client"

import { createTheme, ThemeProvider } from "@mui/material"
import { orange, green, yellow, red, grey } from "@mui/material/colors"

//https://mui.com/material-ui/customization/palette/
declare module "@mui/material/styles" {
  interface Palette {
    tlRed: Palette["primary"]
    tlYellow: Palette["primary"]
    tlOrange: Palette["primary"]
    tlGreen: Palette["primary"]
    tlGrey: Palette["primary"]
  }
  interface PaletteOptions {
    tlRed: Palette["primary"]
    tlYellow: Palette["primary"]
    tlOrange: Palette["primary"]
    tlGreen: Palette["primary"]
    tlGrey: Palette["primary"]
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    tlRed: true
    tlYellow: true
    tlOrange: true
    tlGreen: true
    tlGrey: true
  }
}

declare module "@mui/material/Box" {
  interface BoxPropsColorOverrides {
    tlRed: true
    tlYellow: true
    tlOrange: true
    tlGreen: true
    tlGrey: true
  }
}

declare module "@mui/material/Slider" {
  interface SliderPropsColorOverrides {
    tlRed: true
    tlYellow: true
    tlOrange: true
    tlGreen: true
    tlGrey: true
  }
}

declare module "@mui/material/Radio" {
  interface RadioPropsColorOverrides {
    tlRed: true
    tlYellow: true
    tlOrange: true
    tlGreen: true
    tlGrey: true
  }
}

const { palette } = createTheme()

const theme = createTheme({
  palette: {
    tlRed: palette.augmentColor({ color: red }),
    tlYellow: palette.augmentColor({ color: yellow }),
    tlOrange: palette.augmentColor({ color: orange }),
    tlGreen: palette.augmentColor({ color: green }),
    tlGrey: palette.augmentColor({ color: grey }),
    primary: {
      main: "#333333",
    },
  },
})

export default function ThemeClient({
  children,
}: {
  children: React.ReactNode
}) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}
