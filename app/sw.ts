import { defaultCache } from "@serwist/next/worker"
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist"
import { Serwist } from "serwist"

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // precacheOptions: {
  //   // Ignore all URL parameters.
  //   ignoreURLParametersMatching: [/.*/],
  // },
  precacheOptions: {
    urlManipulation: (manipulation) => {
      const url = manipulation.url
      if (url.pathname == '/' || url.pathname == 'index.txt') {
        return [url, new URL(url.href.replace(url.search, ''))]  
      }
      return [url]
    }
  },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: '/offline', // the page that'll display if user goes offline
        matcher({ request }) {
          return request.destination === 'document'
        },
      },
    ],
  },
})

// serwist.addToPrecacheList([
//   { url: "/index.html", revision: null },
//   { url: "/favicon.ico", revision: null },
//   { url: "/icon.svg", revision: null },
// ])

serwist.addEventListeners()
