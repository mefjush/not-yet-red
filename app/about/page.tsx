"use client"

import { AppBar, IconButton, Toolbar, Typography, Stack, Paper, Button } from '@mui/material'
import { Suspense } from 'react'
import BackButton from '../components/BackButton'

function Content() {

  const toolbarElements = (
    <>
      <Stack direction='row' display={'flex'} sx={{ alignItems: "center" }}>
        <BackButton />
        <Typography variant="h6" component="div" noWrap>
          About
        </Typography>
      </Stack>
    </>
  )

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          {toolbarElements}
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Paper sx={{ p: 2, m: 2 }}>
        <Typography variant='h3'>Welcome to <strong>Not Yet Red</strong>!</Typography>

        <p>Not Yet Red lets you design your own intersections using smartphones as traffic lights, turning any space into your very own traffic system. Perfect for kids, this app makes learning about road safety and traffic rules exciting and hands-on.</p>
        <p>Key Features:</p>
        <ul>
          <li><strong>Create Your Own Intersection:</strong> Arrange streets and place traffic lights anywhere in your environment, using your smartphones to control the lights with simple, intuitive controls.</li>
          <li><strong>Learn Through Play:</strong> Teach kids about the importance of traffic lights, road signs, and safe driving habits while having fun.</li>
          <li><strong>Matchbox Car Adventures:</strong> Build mini streets and race tracks for matchbox cars, letting your toys zip through intersections and obey traffic signals just like in real life.</li>
          <li><strong>Interactive Traffic Signals:</strong> Control traffic flow by changing the color of traffic lights, simulating real-world traffic scenarios.</li>
          <li><strong>Educational Gameplay:</strong> Perfect for young learners, the app turns every street corner into an opportunity for exploring the world of traffic safety and urban planning.</li>
        </ul>
        <p>Whether you&apos;re building roads for your toy cars, helping kids understand traffic rules, or simply having fun with a digital model of your own intersection, <strong>Not Yet Red</strong> makes it all possible.</p>
      </Paper>
    </>
  )
}

export default function Home() {
  return (
    <main>
      <Suspense>
        <Content />
      </Suspense>
    </main>
  )
}
