import { useEffect, useRef, useState } from "react"
import type { Clip } from "../content/media"
import { useReducedMotionSafe } from "../hooks/useReducedMotionSafe"
import { afterHeroPlaying, notifyHeroPlaying } from "../lib/heroGate"
import { prefetchMedia } from "../lib/warmMedia"

type Props = {
  clip: Clip
  /** Hero only. Preloads immediately and calls play() on mount. */
  priority?: boolean
  /** Wait until the hero can play through before this clip may download. */
  defer?: boolean
  decorative?: boolean
}

type Slot = {
  node: HTMLVideoElement
  priority: boolean
  /** Full-page marble. Fills a free slot; never crowds out a visible chapter. */
  background: boolean
  ratio: number
}

const slots = new Map<HTMLVideoElement, Slot>()
const MAX_DECODERS = 2
let kickBound = false

function reconcile() {
  const live = [...slots.values()].filter((slot) => slot.node.isConnected)
  const content = live
    .filter((slot) => !slot.background && slot.ratio >= 0.2)
    .sort((a, b) => Number(b.priority) - Number(a.priority) || b.ratio - a.ratio)
  const keep = new Set(content.slice(0, MAX_DECODERS).map((slot) => slot.node))
  if (keep.size < MAX_DECODERS) {
    const background = live.find((slot) => slot.background && slot.ratio >= 0.2)
    if (background) keep.add(background.node)
  }
  for (const slot of live) {
    if (keep.has(slot.node)) tryPlay(slot.node)
    else slot.node.pause()
  }
}

function forceMuted(node: HTMLVideoElement) {
  node.muted = true
  node.defaultMuted = true
  node.playsInline = true
  node.autoplay = true
  node.loop = true
  node.setAttribute("muted", "")
  node.setAttribute("playsinline", "")
  node.setAttribute("webkit-playsinline", "true")
  node.setAttribute("autoplay", "")
  node.setAttribute("loop", "")
}

function tryPlay(node: HTMLVideoElement) {
  forceMuted(node)
  if (node.preload !== "auto") {
    node.preload = "auto"
    node.setAttribute("preload", "auto")
  }
  const pending = node.play()
  if (pending) pending.catch(() => {})
}

function bindKick() {
  if (kickBound || typeof window === "undefined") return
  kickBound = true
  const replay = () => {
    notifyHeroPlaying()
    reconcile()
  }
  window.addEventListener("touchstart", replay, { passive: true })
  window.addEventListener("pointerdown", replay)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      slots.forEach((slot) => slot.node.pause())
      return
    }
    replay()
  })
}

/**
 * Poster stays opaque until the first playing frame, then fades.
 * Only the hero (priority) downloads on load. Other clips stay src-less
 * until they are near the viewport.
 */
export function LoopMedia({ clip, priority = false, defer = false, decorative = false }: Props) {
  const reduce = useReducedMotionSafe()
  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [near, setNear] = useState(priority)
  const [released, setReleased] = useState(priority || !defer)
  const [playing, setPlaying] = useState(false)
  const showVideo = Boolean(clip.src) && !reduce
  const loadNow = priority || (near && released)

  const attach = (node: HTMLVideoElement | null) => {
    if (videoRef.current && videoRef.current !== node) slots.delete(videoRef.current)
    videoRef.current = node
    if (!node) {
      reconcile()
      return
    }
    slots.set(node, {
      node,
      priority,
      background: defer,
      ratio: priority ? 1 : 0,
    })
    bindKick()
    forceMuted(node)
    node.preload = priority ? "auto" : "none"
    node.setAttribute("preload", priority ? "auto" : "none")
    reconcile()
  }

  useEffect(() => {
    if (priority) {
      const fallback = window.setTimeout(() => notifyHeroPlaying(), 6000)
      return () => window.clearTimeout(fallback)
    }
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setNear(true)
      },
      { rootMargin: "0px", threshold: 0.08 },
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [priority])

  useEffect(() => {
    if (!defer || priority) return
    return afterHeroPlaying(() => setReleased(true))
  }, [defer, priority])

  // Buffer the next clip about one viewport before it arrives. Playback still
  // waits until the section is actually on screen.
  useEffect(() => {
    if (!clip.src || priority || defer) return
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) prefetchMedia(clip.src)
      },
      { rootMargin: "0px 0px 100% 0px", threshold: 0 },
    )
    const stop = afterHeroPlaying(() => observer.observe(root))
    return () => {
      stop()
      observer.disconnect()
    }
  }, [clip.src, priority, defer])

  useEffect(() => {
    const root = rootRef.current
    const video = videoRef.current
    if (!root || !video || !loadNow) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        const slot = slots.get(video)
        if (!slot || !entry) return
        slot.ratio = entry.intersectionRatio
        reconcile()
      },
      { threshold: [0, 0.2, 0.5, 0.8, 1] },
    )
    observer.observe(root)
    return () => {
      observer.disconnect()
      const slot = slots.get(video)
      if (slot) slot.ratio = 0
      video.pause()
      reconcile()
    }
  }, [loadNow, clip.src])

  if (!showVideo) {
    return (
      <img
        className="media-fill"
        src={clip.poster}
        alt={decorative ? "" : clip.alt}
        width={1280}
        height={720}
        decoding={priority ? "sync" : "async"}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "low"}
      />
    )
  }

  return (
    <div ref={rootRef} className={`media-fill ${playing ? "is-playing" : ""}`}>
      <img
        className="media-fill__poster"
        src={loadNow ? clip.poster : undefined}
        alt=""
        width={1280}
        height={720}
        decoding={priority ? "sync" : "async"}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "low"}
      />
      {loadNow && clip.src ? (
        <video
          ref={attach}
          className="media-fill__video"
          src={clip.src}
          poster={clip.poster}
          muted
          playsInline
          autoPlay
          loop
          preload={priority ? "auto" : "none"}
          aria-hidden={decorative ? true : undefined}
          aria-label={decorative ? undefined : clip.alt}
          onPlaying={() => setPlaying(true)}
          onCanPlay={() => reconcile()}
          onCanPlayThrough={() => {
            if (priority) notifyHeroPlaying()
          }}
        />
      ) : null}
    </div>
  )
}
