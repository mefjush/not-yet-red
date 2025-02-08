import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Snackbar,
} from "@mui/material"
import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"

export default function ShareDialog({
  url,
  open,
  onClose,
}: {
  url: string
  open: boolean
  onClose: () => void
}) {
  const [snackOpen, setSnackOpen] = useState(false)

  const copyToClipboard = function (url: string) {
    setSnackOpen(true)
    navigator.clipboard.writeText(url)
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Share</DialogTitle>
      <DialogContent>
        <Box
          noValidate
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            m: "auto",
            width: "fit-content",
          }}
        >
          <QRCodeSVG size={256} value={url} />
          <TextField
            margin="normal"
            label="Url"
            fullWidth
            variant="filled"
            defaultValue={url}
            slotProps={{
              htmlInput: {
                readOnly: true,
              },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="copy to clipboard"
                      onClick={() => copyToClipboard(url)}
                      edge="end"
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
      <Snackbar
        message="Copied to clipboard"
        autoHideDuration={2000}
        onClose={() => setSnackOpen(false)}
        open={snackOpen}
      />
    </Dialog>
  )
}
