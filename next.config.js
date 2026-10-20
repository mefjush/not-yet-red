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
    additionalPrecacheEntries: ["/", "/index.txt"],
  })
  return withSerwist(nextConfig)
}
