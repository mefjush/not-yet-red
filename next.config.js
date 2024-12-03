/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export'
}

const withPWA = require("@ducanh2912/next-pwa").default({
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  dest: "public",
  fallbacks: {
    document: "/", 
  },
  workboxOptions: {
    disableDevLogs: true,
  },
})

module.exports = withPWA(nextConfig)
