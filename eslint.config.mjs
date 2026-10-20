import nextVitals from "eslint-config-next/core-web-vitals"

const config = [
  ...nextVitals,
  { ignores: [".next/", "out/", "coverage/", "public/sw*", "public/swe-worker*"] },
]

export default config
