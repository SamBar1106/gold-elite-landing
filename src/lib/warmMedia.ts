import { afterHeroPlaying } from "./heroGate"
import { publicPath } from "./publicPath"

/** Scroll order. Hero is first so a reload can play it from this cache. */
const WARM_ORDER = [
  "media/hero.mp4",
  "media/gold-storefront.mp4",
  "media/silver-tumble.mp4",
  "media/cash.mp4",
  "media/bring-in.mp4",
  "media/weigh.mp4",
  "media/chains.mp4",
  "media/rings.mp4",
  "media/scrap.mp4",
  "media/bars.mp4",
  "media/website-background.mp4",
].map(publicPath)

const queued = new Set<string>()
const done = new Set<string>()
const queue: string[] = []
let pumping = false
let armed = false

function connection() {
  return (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string }
  }).connection
}

/** Skip background downloads on data-saver and very slow radios. */
export function canWarmMedia() {
  const net = connection()
  if (!net) return true
  if (net.saveData) return false
  return net.effectiveType !== "2g" && net.effectiveType !== "slow-2g"
}

function enqueue(url: string) {
  if (!url || done.has(url) || queued.has(url) || !canWarmMedia()) return
  queued.add(url)
  queue.push(url)
  void pump()
}

async function waitForController() {
  if (!("serviceWorker" in navigator)) return
  await navigator.serviceWorker.ready
  if (navigator.serviceWorker.controller) return
  await Promise.race([
    new Promise<void>((resolve) => {
      navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true })
    }),
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, 8000)
    }),
  ])
}

async function pump() {
  if (pumping) return
  pumping = true
  try {
    await waitForController()
    while (queue.length && canWarmMedia()) {
      const url = queue.shift()
      if (!url) break
      queued.delete(url)
      if (done.has(url)) continue
      try {
        const response = await fetch(url)
        if (response.ok) {
          await response.arrayBuffer()
          done.add(url)
        }
      } catch {
        // Leave it out of `done` so a later scroll can try again.
      }
    }
  } finally {
    pumping = false
    if (queue.length) void pump()
  }
}

/** Fetch one clip into the service worker. Shares the one-at-a-time queue. */
export function prefetchMedia(url: string | undefined) {
  if (!import.meta.env.PROD || !url) return
  enqueue(url)
}

/**
 * After the hero can play: idle, then a short wait, then store clips one by one.
 */
export function startMediaWarm() {
  if (!import.meta.env.PROD || armed) return
  armed = true
  const kick = () => {
    if (!canWarmMedia()) return
    for (const url of WARM_ORDER) enqueue(url)
  }
  window.setTimeout(() => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(kick, { timeout: 4000 })
    } else {
      kick()
    }
  }, 2000)
}

export function watchHeroThenWarm() {
  return afterHeroPlaying(startMediaWarm)
}
