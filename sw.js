/* Gold Elite media cache.
   Bump GE_CACHE when a clip's bytes change at the same URL.
   New filenames do not need a bump. */
const GE_CACHE = "ge-media-v2"
const BASE = "/gold-elite-landing/"
const SHELL = ["/gold-elite-landing/index.html","/gold-elite-landing/media/logo.png","/gold-elite-landing/media/hero.jpg","/gold-elite-landing/assets/index-DVs5_JYL.js","/gold-elite-landing/assets/index-XnCLHEq8.css","/gold-elite-landing/assets/inter-latin-400-normal-C38fXH4l.woff2","/gold-elite-landing/assets/inter-latin-500-normal-Cerq10X2.woff2","/gold-elite-landing/assets/inter-latin-600-normal-LgqL8muc.woff2","/gold-elite-landing/assets/inter-latin-700-normal-Yt3aPRUw.woff2"]
const MEDIA_PREFIX = BASE + "media/"
const INDEX = BASE === "/" ? "/index.html" : BASE + "index.html"
const DOCUMENTS =
  BASE === "/" ? ["/", "/index.html"] : [BASE.slice(0, -1), BASE, INDEX]

const fullLoads = new Map()
const memory = new Map()

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(GE_CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("ge-media-") && key !== GE_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  if (request.method !== "GET") return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (!isInScope(url.pathname)) return

  if (url.pathname.startsWith(MEDIA_PREFIX) && url.pathname.endsWith(".mp4")) {
    event.respondWith(handleMedia(request))
    return
  }

  if (isShell(url.pathname)) {
    event.respondWith(handleShell(request))
  }
})

function isInScope(pathname) {
  if (BASE === "/") return true
  return pathname === BASE.slice(0, -1) || pathname.startsWith(BASE)
}

function isDocument(pathname) {
  return DOCUMENTS.includes(pathname)
}

function isShell(pathname) {
  if (isDocument(pathname)) return true
  return SHELL.includes(pathname)
}

async function handleShell(request) {
  const cache = await caches.open(GE_CACHE)
  const url = new URL(request.url)
  const networkFirst = isDocument(url.pathname)
  if (!networkFirst) {
    const hit = await cache.match(request, { ignoreVary: true })
    if (hit) return hit
  }
  try {
    const response = await fetch(request)
    if (response.ok) await cache.put(request, response.clone())
    return response
  } catch (error) {
    const hit = await cache.match(request, { ignoreVary: true })
    if (hit) return hit
    if (isDocument(url.pathname)) {
      const index = await cache.match(INDEX, { ignoreVary: true })
      if (index) return index
    }
    throw error
  }
}

async function cachedBuffer(href) {
  const remembered = memory.get(href)
  if (remembered) return remembered
  const cache = await caches.open(GE_CACHE)
  const hit = await cache.match(href, { ignoreVary: true })
  if (!hit) return null
  const buffer = await hit.arrayBuffer()
  memory.set(href, buffer)
  return buffer
}

async function handleMedia(request) {
  const url = new URL(request.url)
  url.search = ""
  const href = url.href
  const cached = await cachedBuffer(href)
  if (cached) return rangeResponse(request, cached)

  if (fullLoads.has(href)) {
    return rangeResponse(request, await fullLoads.get(href))
  }

  // A Range from the video element must not wait on a full download, and a
  // 206 must not be stored as if it were the whole file.
  if (request.headers.has("Range")) return fetch(request)

  return rangeResponse(request, await loadFull(href))
}

function loadFull(href) {
  const task = (async () => {
    const already = await cachedBuffer(href)
    if (already) return already
    const cache = await caches.open(GE_CACHE)
    const response = await fetch(href)
    if (!response.ok || response.status !== 200) {
      throw new Error("media " + response.status)
    }
    const stored = response.clone()
    const buffer = await response.arrayBuffer()
    await cache.put(href, stored)
    memory.set(href, buffer)
    return buffer
  })().finally(() => fullLoads.delete(href))
  fullLoads.set(href, task)
  return task
}

function rangeResponse(request, buffer) {
  const total = buffer.byteLength
  const header = request.headers.get("Range")
  if (!header) {
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(total),
        "Accept-Ranges": "bytes",
      },
    })
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim())
  if (!match) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${total}` },
    })
  }

  let start = match[1] === "" ? null : Number(match[1])
  let end = match[2] === "" ? null : Number(match[2])
  if (start === null) {
    const suffix = end ?? 0
    start = Math.max(total - suffix, 0)
    end = total - 1
  } else if (end === null || end >= total) {
    end = total - 1
  }

  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= total) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${total}` },
    })
  }

  const slice = buffer.slice(start, end + 1)
  return new Response(slice, {
    status: 206,
    headers: {
      "Content-Type": "video/mp4",
      "Content-Range": `bytes ${start}-${end}/${total}`,
      "Content-Length": String(slice.byteLength),
      "Accept-Ranges": "bytes",
    },
  })
}
