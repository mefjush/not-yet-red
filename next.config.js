const { PHASE_PRODUCTION_BUILD } = require("next/constants")

/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "export",
}

// ponytail: service worker only in production builds (Serwist needs webpack, dev runs on Turbopack)
module.exports = async (phase) => {
  if (phase !== PHASE_PRODUCTION_BUILD) {
    return nextConfig
  }
  const withSerwist = (await import("@serwist/next")).default({
    swSrc: "app/sw.ts",
    swDest: "public/sw.js",
    scope: "/",
    // a fresh revision per build so cached pages are refreshed after each deploy
    // everything a visitor can open, so the installed app works fully offline after its first visit
    additionalPrecacheEntries: [
      "/",
      "/index.txt",
      "/intersection",
      "/privacy",
      "/icon.svg",
      "/favicon.ico",
      "/manifest.webmanifest",
    ].map((url) => ({
      url,
      revision: Date.now().toString(),
    })),
  })
  return withSerwist(nextConfig)
}
