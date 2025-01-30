import { MetadataRoute } from "next"

export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: 'not-yet-red',
    name: 'Not Yet Red',
    short_name: 'Not Yet Red',
    description: 'Build your own intersection using smartphones as traffic lights.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}