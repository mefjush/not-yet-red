# Not Yet Red 🚦

[Not Yet Red](https://not.yet.red) is a fun and interactive traffic light simulator that turns any space into a real-life intersection using smartphones as traffic lights. Perfect for kids, it makes learning traffic rules hands-on and exciting.

## Features

- 🚦 Design custom intersections with various traffic light types.
- 📱 Sync multiple devices without an internet connection.
- ⏳ Set custom light durations and control the flow.
- 🎮 Great for play, learning, and household traffic management!

Whether you're following the rules or making a last-second dash before the red, _Not Yet Red_ brings traffic fun to life!

## Stack

Next.js 16 (static export), React 19, MUI 9, nuqs for URL state, Serwist for offline support.

## Development

```sh
npm install
npm run dev     # dev server (Turbopack, no service worker)
npm test        # unit tests (Vitest)
npm run lint
npm run build   # static site in ./out, with service worker
```
