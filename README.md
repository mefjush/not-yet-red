# Not Yet Red 🚦

[Not Yet Red](https://not.yet.red) turns smartphones into traffic lights. Set up an intersection, open it on a few phones, stand them around a hallway, garden or toy car track, and play traffic. It's made for kids: they learn road rules by following the lights (or by trying to make it through just before the red).

## What it does

- **Build an intersection.** Add lights, group them into phones, and set how long each phase lasts on a timeline.
- **Many kinds of lights.** Car lights (4- and 3-phase), turn arrows, conditional right, pedestrian lights (2- and 3-phase, with flashing green), bicycle, tram, railway crossing, and a flashing yellow warning light.
- **Crossing sounds.** Pedestrian lights beep like Polish acoustic signals (stop, go, hurry up) and railway crossings ring a bell. Off by default, switched on per phone in fullscreen.
- **Share with a QR code.** Every phone that opens the link runs the same intersection.
- **Fullscreen mode.** Each phone shows its own light; swipe to switch between phones.
- **Ready-made setups** on the home page, each with a sketch of where to put the phones.
- **Works offline** once loaded, and installs as an app.

### How phones stay in sync

There is no server and no connection between phones. The whole setup lives in the page link, and every phone works out the current state of each light from its clock. Phones whose clocks agree show the same lights. The app also checks the time against [timeapi.io](https://timeapi.io) when it starts, and the settings let you nudge a phone that runs ahead or behind.

## Development

Use Node 24 with an up-to-date npm (the deploy runs npm 11.19). An older npm can write a lock file that `npm ci` on the deploy runner rejects.

```sh
npm install
npm run dev     # dev server on http://localhost:3000 (Turbopack, no service worker)
npm test        # unit tests (Vitest)
npm run lint
npm run build   # static site in ./out, with the service worker
```

Built with Next.js 16 (static export), React 19, MUI 9, [nuqs](https://nuqs.dev) for state in the URL and [Serwist](https://serwist.pages.dev) for offline support.

### Where things are

- `app/domain` has the light logic: phases, timing, light types, URL format. No UI.
- `app/components` holds the UI, and `app/components/scenarios.ts` the ready-made setups.
- `app/hooks` contains the clock, the hydration helper and the crossing sounds.
- `__tests__` mirrors the above. Scenario tests check that lights that would let traffic collide are never green together.

### Link format

The intersection is stored in the query string, for example:

```
/intersection?lights=0--R16-RY2-G10-Y2--FOUR_PHASE,15--R17-G9-GF4--PEDESTRIAN_FLASHING
```

- Commas separate phones, and `---` separates lights on the same phone.
- Each light is `offset--phases--type`: the offset in seconds, then each phase as its initials and length in seconds (`R16` is 16 s of red, `GF4` 4 s of flashing green), then the light type.
- An optional `intersection=30-30-0` sets the cycle length, failure duration and failure chance.

Shared links have to keep working, so treat this format as public.

## Deployment

Pushing to `master` runs the GitHub Actions workflow, which runs the tests, builds the static site and publishes it to GitHub Pages. CloudFront serves not.yet.red from the GitHub Pages site, so a new version can take up to 10 minutes to show while the cache expires.

`public/.well-known/assetlinks.json` links the site to the Android app (`red.yet.not.twa`). Keep it in the build.
