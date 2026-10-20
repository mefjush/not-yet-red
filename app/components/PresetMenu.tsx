import { Stack, Select, MenuItem, Box, Typography, useTheme } from "@mui/material"
import { createElement } from "react"
import LightConfig from "../domain/LightConfig"
import { Preset, PresetId, PRESETS, SYMBOLS, SymbolId } from "../domain/Preset"
import { State } from "../domain/State"

const LAMP = 11

// a tiny drawing of the light with every lamp lit, so each type is recognisable at a glance
function PresetIcon({ preset }: { preset: Preset }) {
  const theme = useTheme()
  const symbol = SYMBOLS[preset.symbolId]
  const hasSymbol = preset.symbolId != SymbolId.NONE

  return (
    // fixed box so the names line up whatever the light's shape
    <Box
      sx={{
        width: 32,
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack
        direction={preset.horizontal ? "row" : "column"}
        aria-hidden
        sx={{ gap: "2px", p: "2px", borderRadius: "4px", bgcolor: "#161616" }}
      >
        {preset.colors.map((segment, idx) => {
          const color = (symbol.white ? theme.palette.tlWhite : theme.palette[segment]).main
          const inverted = symbol.isInverted(segment)
          // symbols glow on a black lens, except arrows on red/yellow: black arrow on a lit lens
          const litLens = !hasSymbol || inverted
          return (
            <Box
              key={idx}
              sx={{
                width: LAMP,
                height: LAMP,
                borderRadius: "50%",
                bgcolor: litLens ? color : "#050505",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {hasSymbol &&
                createElement(symbol.getIcon(segment), {
                  sx: { fontSize: LAMP - 1, color: inverted ? "#050505" : color },
                })}
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}

export default function PresetMenu({
  lightConfig,
  selectedState,
  onLightConfigChange,
  setSelectedState,
}: {
  lightConfig: LightConfig
  selectedState: State
  onLightConfigChange: (lightConfig: LightConfig) => void
  setSelectedState: (state: State) => void
}) {
  const changePreset = (presetId: PresetId) => {
    const supportedStates = PRESETS[presetId].states
    if (!supportedStates.includes(selectedState)) {
      setSelectedState(supportedStates[0])
    }
    onLightConfigChange(lightConfig.withPreset(PRESETS[presetId]))
  }

  return (
    <Select
      fullWidth
      size="small"
      value={lightConfig.preset.presetId}
      onChange={(event) => changePreset(event.target.value as PresetId)}
      // the closed field shows just the icon and name
      renderValue={(presetId) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <PresetIcon preset={PRESETS[presetId]} />
          <span>{PRESETS[presetId].name}</span>
        </Stack>
      )}
    >
      {Object.values(PRESETS).map((preset) => (
        <MenuItem key={preset.presetId} value={preset.presetId}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <PresetIcon preset={preset} />
            <div>
              <div>{preset.name}</div>
              {/* the phase order tells apart lights that look the same, e.g. 4- and 3-phase */}
              <Typography variant="caption" color="text.secondary">
                {preset.states.map((state) => preset.phaseName(state)).join(" → ")}
              </Typography>
            </div>
          </Stack>
        </MenuItem>
      ))}
    </Select>
  )
}
