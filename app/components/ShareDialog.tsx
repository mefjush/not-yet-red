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
  Typography,
  Tooltip,
} from "@mui/material"
import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import CheckIcon from "@mui/icons-material/Check"
import IosShareIcon from "@mui/icons-material/IosShare"

export default function ShareDialog({
  url,
  open,
  onClose,
}: {
  url: string
  open: boolean
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  // the dialog only mounts in the browser, so navigator is safe here
  const canShare = typeof navigator != "undefined" && typeof navigator.share == "function"

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const share = () => navigator.share({ title: "Not Yet Red", url }).catch(() => {})

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Share this intersection</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Scan the code with another phone. Each phone shows the same intersection, perfectly in
          sync.
        </Typography>
        <Box
          sx={{ display: "flex", justifyContent: "center", p: 2, bgcolor: "#fff", borderRadius: 3 }}
        >
          <QRCodeSVG
            size={224}
            value={url}
            style={{ width: "100%", height: "auto", maxWidth: 224 }}
          />
        </Box>
        <TextField
          margin="normal"
          label="Link"
          fullWidth
          value={url}
          slotProps={{
            htmlInput: {
              readOnly: true,
              onFocus: (e: React.FocusEvent<HTMLInputElement>) => e.target.select(),
            },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={copied ? "Copied!" : "Copy link"}>
                    <IconButton aria-label="Copy link" onClick={copyToClipboard} edge="end">
                      {copied ? <CheckIcon color="success" /> : <ContentCopyIcon />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {canShare && (
          <Button variant="contained" startIcon={<IosShareIcon />} onClick={share}>
            Share…
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
