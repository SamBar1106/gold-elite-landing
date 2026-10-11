import { motion, useScroll, useTransform } from "motion/react"
import { useRef, useState } from "react"
import { useReducedMotionSafe } from "../hooks/useReducedMotionSafe"
import { CallTextPair } from "./CallText"
import { FrostedPlate } from "./FrostedPlate"
import { HeroCarousel, type HeroFrame } from "./HeroCarousel"

const headlines = [
  ["Sell gold & silver.", "Cash today."],
  ["Cash for gold.", "Paid today."],
  ["Cash for silver.", "Paid today."],
] as const

const settled: HeroFrame = { current: 0, incoming: null, moving: false }

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotionSafe()
  const [frame, setFrame] = useState<HeroFrame>(settled)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.16])

  return (
    <section className="hero" id="hero" ref={ref} aria-labelledby="hero-title">
      <motion.div className="hero__media frame" style={reduce ? undefined : { scale }}>
        <HeroCarousel onFrame={setFrame} />
      </motion.div>
      <div className="hero__shade" aria-hidden="true" />
      <div className="hero__content">
        <FrostedPlate>
          <span className="plate__rule" aria-hidden="true" />
          <h1 id="hero-title" className="green-title hero-title" aria-live="off">
            {headlines.map((lines, index) => {
              const isIncoming = index === frame.incoming
              const isCurrent = index === frame.current
              let className = ""
              if (isIncoming && frame.moving) className = "is-in is-go"
              else if (isIncoming) className = "is-in"
              else if (isCurrent && frame.moving && frame.incoming !== null) className = "is-out"
              else if (isCurrent) className = "is-current"
              const shown = className === "is-current" || className === "is-in is-go"
              return (
                <span key={lines[0]} className={className} aria-hidden={shown ? undefined : true}>
                  {lines[0]}
                  <br />
                  {lines[1]}
                </span>
              )
            })}
          </h1>
          <p className="lede">Fair price in Broadview. Walk in or text us a photo.</p>
          <CallTextPair size="lg" tone="hero" />
        </FrostedPlate>
      </div>
    </section>
  )
}
