import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { media } from "../content/media"
import { useReducedMotionSafe } from "../hooks/useReducedMotionSafe"
import { notifyHeroPlaying } from "../lib/heroGate"
import { prefetchMedia } from "../lib/warmMedia"

const slides = [
  { clip: media.hero, label: "Show the shop" },
  { clip: media.goldStorefront, label: "Show cash for gold" },
  { clip: media.silverTumble, label: "Show cash for silver" },
] as const

type Props = {
  onLit?: (index: number) => void
}

const FADE_MS = 800
const HOLD_MS = 7500
const PRELOAD_AT = 4.2

function mute(node: HTMLVideoElement) {
  node.muted = true
  node.defaultMuted = true
  node.playsInline = true
  node.loop = false
  node.autoplay = false
  node.setAttribute("muted", "")
  node.setAttribute("playsinline", "")
  node.setAttribute("webkit-playsinline", "true")
  node.removeAttribute("loop")
}

export function HeroCarousel({ onLit }: Props) {
  const reduce = useReducedMotionSafe()
  const rootRef = useRef<HTMLDivElement>(null)
  const videos = useRef<Array<HTMLVideoElement | null>>([])
  const activeRef = useRef(0)
  const holdRef = useRef(false)
  const primed = useRef(false)
  const fadeTimer = useRef<number | null>(null)
  const [active, setActive] = useState(0)
  const [lit, setLit] = useState(0)
  const [holdIndex, setHoldIndex] = useState<number | null>(null)
  const [preloadNext, setPreloadNext] = useState(false)
  const [onScreen, setOnScreen] = useState(true)
  const [tabHidden, setTabHidden] = useState(false)
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [started, setStarted] = useState<boolean[]>(() => slides.map(() => false))
  const hold = !onScreen || tabHidden

  const go = useCallback((next: number) => {
    const from = activeRef.current
    if (next === from) return
    activeRef.current = next
    primed.current = false
    const incoming = videos.current[next]
    if (incoming) {
      mute(incoming)
      try {
        incoming.currentTime = 0
      } catch {
        /* not seekable yet */
      }
      void incoming.play()?.catch(() => {})
    }
    setHoldIndex(from)
    setActive(next)
    setPreloadNext(false)
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setLit(next))
    })
    if (fadeTimer.current !== null) window.clearTimeout(fadeTimer.current)
    fadeTimer.current = window.setTimeout(() => {
      fadeTimer.current = null
      setHoldIndex((current) => (current === from ? null : current))
      const previous = videos.current[from]
      if (previous && activeRef.current !== from) {
        previous.pause()
        try {
          previous.currentTime = 0
        } catch {
          /* detached */
        }
      }
    }, FADE_MS)
  }, [])

  useEffect(() => {
    onLit?.(lit)
  }, [lit, onLit])

  useLayoutEffect(() => {
    holdRef.current = hold
  }, [hold])

  useLayoutEffect(() => {
    setHost(rootRef.current?.closest(".hero") ?? null)
  }, [reduce])

  useEffect(() => {
    return () => {
      if (fadeTimer.current !== null) window.clearTimeout(fadeTimer.current)
    }
  }, [])

  useEffect(() => {
    if (reduce) return
    const fallback = window.setTimeout(() => notifyHeroPlaying(), 6000)
    const kick = () => {
      notifyHeroPlaying()
      const node = videos.current[activeRef.current]
      if (node && !holdRef.current) void node.play()?.catch(() => {})
    }
    window.addEventListener("pointerdown", kick)
    return () => {
      window.clearTimeout(fallback)
      window.removeEventListener("pointerdown", kick)
    }
  }, [reduce])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen((entry?.intersectionRatio ?? 0) >= 0.25),
      { threshold: [0, 0.25, 0.6] },
    )
    observer.observe(root)
    const onVis = () => setTabHidden(document.hidden)
    document.addEventListener("visibilitychange", onVis)
    return () => {
      observer.disconnect()
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [reduce])

  useEffect(() => {
    if (reduce) return
    const ids = new Set<number>([active])
    if (holdIndex !== null) ids.add(holdIndex)
    for (const id of ids) {
      const node = videos.current[id]
      if (!node) continue
      mute(node)
      if (hold) node.pause()
      else void node.play()?.catch(() => {})
    }
  }, [active, holdIndex, hold, reduce])

  useEffect(() => {
    if (reduce || hold) return
    const index = active
    const timer = window.setTimeout(() => {
      if (activeRef.current === index) go((index + 1) % slides.length)
    }, HOLD_MS)
    return () => window.clearTimeout(timer)
  }, [active, hold, reduce, go])

  useEffect(() => {
    if (!preloadNext || reduce) return
    const index = (activeRef.current + 1) % slides.length
    const node = videos.current[index]
    if (!node) return
    mute(node)
    const park = () => {
      if (activeRef.current !== index) {
        node.pause()
        try {
          node.currentTime = 0
        } catch {
          /* not seekable yet */
        }
      }
    }
    node.addEventListener("canplay", park, { once: true })
    void node.play()?.then(park).catch(() => {})
    return () => node.removeEventListener("canplay", park)
  }, [preloadNext, reduce, active])

  if (reduce) {
    return (
      <img
        className="hero-slide is-on"
        src={slides[0].clip.poster}
        alt=""
        width={1280}
        height={720}
        decoding="sync"
        fetchPriority="high"
      />
    )
  }

  const nextIndex = (active + 1) % slides.length
  const mounted = new Set<number>([active, lit])
  if (holdIndex !== null) mounted.add(holdIndex)
  if (preloadNext) mounted.add(nextIndex)

  const dots = (
    <div className={`hero-dots${hold ? " is-paused" : ""}`} role="group" aria-label="Hero videos">
      {slides.map((slide, index) => (
        <button
          key={slide.clip.src}
          type="button"
          className={index === lit ? "is-on" : ""}
          aria-label={slide.label}
          aria-current={index === lit ? "true" : undefined}
          onClick={() => go(index)}
        >
          <i>
            <span key={index === lit ? `run-${lit}` : "idle"} />
          </i>
        </button>
      ))}
    </div>
  )

  return (
    <div ref={rootRef} className="hero-slides">
      {slides.map((slide, index) => {
        if (!mounted.has(index) || !slide.clip.src) return null
        const isFirst = index === 0
        const isActive = index === active
        return (
          <div key={slide.clip.src} className={`hero-slide${index === lit ? " is-on" : ""}`}>
            <img
              className={`hero-slide__poster${started[index] ? " is-hidden" : ""}`}
              src={slide.clip.poster}
              alt=""
              width={1280}
              height={720}
              decoding={isFirst ? "sync" : "async"}
              fetchPriority={isFirst ? "high" : "low"}
            />
            <video
              ref={(node) => {
                videos.current[index] = node
                if (!node) return
                mute(node)
              }}
              className="hero-slide__video"
              src={slide.clip.src}
              poster={slide.clip.poster}
              muted
              playsInline
              autoPlay={isActive}
              preload="auto"
              aria-hidden="true"
              onPlaying={() => {
                if (index !== activeRef.current) return
                setStarted((current) => {
                  if (current[index]) return current
                  const copy = current.slice()
                  copy[index] = true
                  return copy
                })
                if (isFirst) notifyHeroPlaying()
              }}
              onCanPlayThrough={() => {
                if (isFirst) notifyHeroPlaying()
              }}
              onTimeUpdate={(event) => {
                if (index !== activeRef.current || primed.current) return
                if (event.currentTarget.currentTime < PRELOAD_AT) return
                primed.current = true
                setPreloadNext(true)
                const upcoming = slides[(index + 1) % slides.length].clip.src
                if (upcoming) prefetchMedia(upcoming)
              }}
              onEnded={() => {
                if (index === activeRef.current) go((index + 1) % slides.length)
              }}
            />
          </div>
        )
      })}
      {host ? createPortal(dots, host) : dots}
    </div>
  )
}
