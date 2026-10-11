import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { media } from "../content/media"
import { useReducedMotionSafe } from "../hooks/useReducedMotionSafe"
import { notifyHeroPlaying } from "../lib/heroGate"

const slides = [
  { clip: media.hero, label: "Show the shop" },
  { clip: media.goldStorefront, label: "Show cash for gold" },
  { clip: media.silverTumble, label: "Show cash for silver" },
] as const

export type HeroFrame = {
  current: number
  incoming: number | null
  moving: boolean
}

type Props = {
  onFrame?: (frame: HeroFrame) => void
}

const WIPE_MS = 600
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

function canPlay(node: HTMLVideoElement | null) {
  return !!node && node.readyState >= 3
}

export function HeroCarousel({ onFrame }: Props) {
  const reduce = useReducedMotionSafe()
  const rootRef = useRef<HTMLDivElement>(null)
  const videos = useRef<Array<HTMLVideoElement | null>>([])
  const posters = useRef<Array<HTMLImageElement | null>>([])
  const activeRef = useRef(0)
  const incomingRef = useRef<number | null>(null)
  const wipingRef = useRef(false)
  const wantRef = useRef<number | null>(null)
  const armedRef = useRef<number | null>(null)
  const holdRef = useRef(false)
  const wipeTimer = useRef<number | null>(null)
  const onFrameRef = useRef(onFrame)
  const [active, setActive] = useState(0)
  const [incoming, setIncoming] = useState<number | null>(null)
  const [wipeOn, setWipeOn] = useState(false)
  const [armed, setArmed] = useState<number | null>(null)
  const [onScreen, setOnScreen] = useState(true)
  const [tabHidden, setTabHidden] = useState(false)
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [posterOff, setPosterOff] = useState<boolean[]>(() => slides.map(() => false))
  const hold = !onScreen || tabHidden

  useLayoutEffect(() => {
    onFrameRef.current = onFrame
  }, [onFrame])

  useLayoutEffect(() => {
    holdRef.current = hold
  }, [hold])

  const publish = useCallback((frame: HeroFrame) => {
    onFrameRef.current?.(frame)
  }, [])

  const finishWipe = useCallback(
    (next: number) => {
      if (!wipingRef.current || incomingRef.current !== next) return
      if (wipeTimer.current !== null) {
        window.clearTimeout(wipeTimer.current)
        wipeTimer.current = null
      }
      const from = activeRef.current
      const previous = videos.current[from]
      if (previous && from !== next) {
        previous.pause()
        try {
          previous.currentTime = 0
        } catch {
          /* detached */
        }
      }
      wipingRef.current = false
      incomingRef.current = null
      activeRef.current = next
      setPosterOff((current) => {
        const copy = current.slice()
        copy[from] = false
        copy[next] = false
        return copy
      })
      setActive(next)
      setIncoming(null)
      setWipeOn(false)
      if (armedRef.current === next) {
        armedRef.current = null
        setArmed(null)
      }
      publish({ current: next, incoming: null, moving: false })
      const queued = wantRef.current
      if (queued !== null && queued !== next) {
        wantRef.current = queued
      } else {
        wantRef.current = null
      }
    },
    [publish],
  )

  const startWipe = useCallback(
    (next: number) => {
      if (wipingRef.current || holdRef.current || next === activeRef.current) return
      const node = videos.current[next]
      if (!canPlay(node)) return
      const poster = posters.current[next]
      if (poster && !(poster.complete && poster.naturalWidth > 0)) return
      if (node) {
        node.pause()
        try {
          node.currentTime = 0
        } catch {
          /* not seekable yet */
        }
      }
      wipingRef.current = true
      incomingRef.current = next
      setIncoming(next)
      setWipeOn(false)
      publish({ current: activeRef.current, incoming: next, moving: false })
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          if (!wipingRef.current || incomingRef.current !== next) return
          setWipeOn(true)
          publish({ current: activeRef.current, incoming: next, moving: true })
        })
      })
      if (wipeTimer.current !== null) window.clearTimeout(wipeTimer.current)
      wipeTimer.current = window.setTimeout(() => finishWipe(next), WIPE_MS + 40)
    },
    [finishWipe, publish],
  )

  const requestGo = useCallback(
    (next: number) => {
      if (reduce || next === activeRef.current) return
      wantRef.current = next
      if (armedRef.current !== next) {
        armedRef.current = next
        setArmed(next)
      }
      if (wipingRef.current || holdRef.current) return
      startWipe(next)
    },
    [reduce, startWipe],
  )

  useEffect(() => {
    const boot = document.querySelector(".boot-poster")
    if (!boot) return
    const drop = () => boot.remove()
    const video = videos.current[0]
    if (video && video.readyState >= 2) drop()
    else video?.addEventListener("loadeddata", drop, { once: true })
    const timer = window.setTimeout(drop, 2500)
    return () => {
      window.clearTimeout(timer)
      video?.removeEventListener("loadeddata", drop)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (wipeTimer.current !== null) window.clearTimeout(wipeTimer.current)
    }
  }, [])

  useLayoutEffect(() => {
    setHost(rootRef.current?.closest(".hero") ?? null)
  }, [reduce])

  useEffect(() => {
    if (reduce) return
    const fallback = window.setTimeout(() => notifyHeroPlaying(), 6000)
    const kick = () => {
      notifyHeroPlaying()
      const node = videos.current[activeRef.current]
      if (node && !holdRef.current && !wipingRef.current) void node.play()?.catch(() => {})
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
    for (let index = 0; index < slides.length; index += 1) {
      const node = videos.current[index]
      if (!node) continue
      mute(node)
      const playing = index === active && incoming === null && !hold
      const warming = index === armed && index !== active && incoming !== index && node.readyState < 3
      if (playing || warming) {
        void node.play()?.catch(() => {})
      } else {
        node.pause()
        if (index !== active && index !== incoming && node.currentTime > 0.05) {
          try {
            node.currentTime = 0
          } catch {
            /* not seekable yet */
          }
        }
      }
    }
  }, [active, incoming, hold, reduce, armed, wipeOn])

  useEffect(() => {
    if (reduce || hold || wipingRef.current) return
    const queued = wantRef.current
    if (queued === null || queued === active) return
    startWipe(queued)
  }, [armed, hold, reduce, active, startWipe])

  useEffect(() => {
    if (reduce || hold || incoming !== null) return
    const index = active
    const timer = window.setTimeout(() => {
      if (activeRef.current === index && !wipingRef.current) {
        requestGo((index + 1) % slides.length)
      }
    }, HOLD_MS)
    return () => window.clearTimeout(timer)
  }, [active, hold, reduce, incoming, requestGo])

  const lit = wipeOn && incoming !== null ? incoming : active

  if (reduce) {
    return (
      <img
        className="hero-slide is-current"
        src={slides[0].clip.poster}
        alt=""
        width={1280}
        height={720}
        decoding="sync"
        fetchPriority="high"
      />
    )
  }

  const mounted = new Set<number>([active])
  if (incoming !== null) mounted.add(incoming)
  if (armed !== null) mounted.add(armed)

  const dots = (
    <div className={`hero-dots${hold ? " is-paused" : ""}`} role="group" aria-label="Hero videos">
      {slides.map((slide, index) => (
        <button
          key={slide.clip.src}
          type="button"
          className={index === lit ? "is-on" : ""}
          aria-label={slide.label}
          aria-current={index === lit ? "true" : undefined}
          onClick={() => requestGo(index)}
        >
          <i>
            <span key={index === lit ? `run-${lit}` : "idle"} />
          </i>
        </button>
      ))}
    </div>
  )

  return (
    <div
      ref={rootRef}
      className="hero-slides"
      data-hero-phase={wipeOn ? "wipe" : "settled"}
      data-hero-slide={lit}
    >
      {slides.map((slide, index) => {
        if (!mounted.has(index) || !slide.clip.src) return null
        const isIncoming = index === incoming
        const isCurrent = index === active
        let className = "hero-slide"
        if (isIncoming) className += wipeOn ? " is-in is-go" : " is-in"
        else if (isCurrent) className += wipeOn && incoming !== null ? " is-current is-out" : " is-current"
        const showPoster = !(isCurrent && posterOff[index] && !isIncoming)
        return (
          <div
            key={slide.clip.src}
            className={className}
            onTransitionEnd={(event) => {
              if (event.propertyName !== "transform") return
              if (event.target !== event.currentTarget) return
              if (isIncoming && wipeOn) finishWipe(index)
            }}
          >
            <img
              ref={(node) => {
                posters.current[index] = node
              }}
              className={`hero-slide__poster${showPoster ? "" : " is-hidden"}`}
              src={slide.clip.poster}
              alt=""
              width={1280}
              height={720}
              decoding={index === 0 ? "sync" : "async"}
              fetchPriority={index === 0 ? "high" : "low"}
              onLoad={() => {
                if (wantRef.current === index && !holdRef.current) startWipe(index)
              }}
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
              autoPlay={isCurrent && incoming === null}
              preload="auto"
              aria-hidden="true"
              onPlaying={() => {
                if (index !== activeRef.current || wipingRef.current) return
                setPosterOff((current) => {
                  if (current[index]) return current
                  const copy = current.slice()
                  copy[index] = true
                  return copy
                })
                if (index === 0) notifyHeroPlaying()
              }}
              onCanPlay={(event) => {
                const node = event.currentTarget
                if (node.readyState < 3) return
                if (index === 0) notifyHeroPlaying()
                if (index !== activeRef.current && index !== incomingRef.current) node.pause()
                if (wantRef.current === index && !holdRef.current) startWipe(index)
              }}
              onCanPlayThrough={(event) => {
                const node = event.currentTarget
                if (index === 0) notifyHeroPlaying()
                if (index !== activeRef.current && index !== incomingRef.current) node.pause()
                if (wantRef.current === index && !holdRef.current) startWipe(index)
              }}
              onTimeUpdate={(event) => {
                if (index !== activeRef.current || wipingRef.current) return
                if (event.currentTarget.currentTime < PRELOAD_AT) return
                const upcoming = (index + 1) % slides.length
                if (armedRef.current === upcoming || incomingRef.current === upcoming) return
                armedRef.current = upcoming
                setArmed(upcoming)
              }}
              onEnded={() => {
                if (index === activeRef.current) requestGo((index + 1) % slides.length)
              }}
            />
          </div>
        )
      })}
      {host ? createPortal(dots, host) : dots}
    </div>
  )
}
