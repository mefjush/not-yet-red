"use client"

import { Paper, Typography } from "@mui/material"

export default function About() {
  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Typography variant="h4" gutterBottom>
        Privacy Policy
      </Typography>
      
      <Typography variant="body1" gutterBottom>
        By using the app <strong>Not Yet Red</strong> you are consenting to our policies regarding the collection, use and disclosure of personal information set out in this privacy policy.
      </Typography>
     
      <Typography variant="h5" gutterBottom>
        Collection of Personal Information
      </Typography>
      
      <Typography variant="body1" gutterBottom>
        We do not collect, store, use or share any information, personal or otherwise.
        </Typography>
      <Typography variant="h5" gutterBottom>
        Email
      </Typography>
      
      <Typography variant="body1" gutterBottom>
        If you email the developer for support or other feedback, the emails with email addresses will be retained for quality assurance purposes. The email addresses will be used only to reply to the concerns or suggestions raised and will never be used for any marketing purpose.
      </Typography>

      <Typography variant="h5" gutterBottom>
        Disclosure of Personal Information
      </Typography>
      
      <Typography variant="body1" gutterBottom>
        We will not disclose your information to any third party except if you expressly consent or where required by law.
      </Typography>

      <Typography variant="h5" gutterBottom>
        Contacting Us
      </Typography>

      <Typography variant="body1" gutterBottom>
        If you have any questions regarding this privacy policy, you can email mefjush[at]gmail.com.
      </Typography>

    </Paper>
  )
}
