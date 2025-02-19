"use client"

import { Paper, Typography } from "@mui/material"

export default function About() {
  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Typography variant="h4" gutterBottom>
        The beginning
      </Typography>
      <Typography variant="body1" gutterBottom>
        It all started with my 5-year-old son, who was frustrated that his toy cars kept getting
        stuck in traffic jams. Wanting to help, I built a simple traffic light simulator for him.
        Little did I know, it would turn into so much more!
        <br />
        <br />
        Before long, our household was obeying (or ignoring) the lights in all sorts of creative
        ways — navigating a laundry-blocked hallway, adding new rules to backyard bike rides, and,
        of course, the ultimate thrill: trying to make it through <i>just</i> before the light turns
        red. That split-second decision — push forward or stop? — became the heart of the game.
        <br />
        <br />
        That&apos;s where the name <i>Not Yet Red</i> comes from. It&apos;s about living on the
        edge, seizing the moment, and dashing forward while you still can (before the inevitable
        dad-police chase begins!). My son loved it, and seeing how much fun (and learning) it
        brought, I knew I had to share it.
        <br />
        <br />
        And that&apos;s how <strong>Not Yet Red</strong> was born—a playful way to explore traffic
        rules, spark imagination, and maybe even avoid a few living-room traffic jams along the way!
      </Typography>

      <Typography variant="h4" sx={{ mt: 3 }} gutterBottom>
        Features
      </Typography>
      <Typography variant="h6" gutterBottom>
        Turn Any Space into a Traffic System
      </Typography>
      <Typography variant="body1" gutterBottom>
        With <strong>Not Yet Red</strong>, you can turn any room, yard, or hallway into your own
        intersection using smartphones as traffic lights. No fancy setups needed—just place the
        devices, and you&apos;ve got a fully working traffic system right where you are.
      </Typography>
      <Typography variant="h6" gutterBottom>
        Customize Your Own Traffic Rules
      </Typography>
      <Typography variant="body1" gutterBottom>
        Want a simple pedestrian crossing? A busy 3-phase intersection? A tricky left-turn arrow?
        You can mix and match different types of lights and even set how long they stay green or
        red. It&apos;s like being the traffic controller of your own little world.
      </Typography>
      <Typography variant="h6" gutterBottom>
        Sync Across Devices — No Internet Needed
      </Typography>
      <Typography variant="body1" gutterBottom>
        One phone controls the lights, and the others follow—just like that. Each light can be
        displayed on a different device, and the best part? They all stay perfectly in sync, even if
        you&apos;re out in the middle of nowhere with no internet.
      </Typography>
      <Typography variant="h6" gutterBottom>
        Serious Learning, Serious Fun
      </Typography>
      <Typography variant="body1" gutterBottom>
        Kids pick up traffic rules without even realizing it. Whether they&apos;re carefully
        following the lights or seeing how long they can dodge the dad-police before getting
        &quot;pulled over,&quot; there&apos;s always a way to play.
      </Typography>
    </Paper>
  )
}
