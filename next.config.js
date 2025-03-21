/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
}

const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } = require("next/constants")

/** @type {(phase: string, defaultConfig: import("next").NextConfig) => Promise<import("next").NextConfig>} */
module.exports = async (phase) => {
  /** @type {import("next").NextConfig} */

  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    const withSerwist = (await import("@serwist/next")).default({
      swSrc: "app/sw.ts",
      swDest: "public/sw.js",
      scope: "/",
      additionalPrecacheEntries: ["/", "/index.txt"],
    })
    return withSerwist(nextConfig)
  }

  return nextConfig
}
