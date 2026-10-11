import { motion, useScroll, useTransform } from "motion/react"
import { useRef, useState } from "react"
import { useReducedMotionSafe } from "../hooks/useReducedMotionSafe"
import { CallTextPair } from "./CallText"
import { FrostedPlate } from "./FrostedPlate"
import { HeroCarousel } from "./HeroCarousel"

const ease = [0.22, 1, 0.36, 1] as const

const headlines = [
  ["Sell gold & silver.", "Cash today."],
  ["Cash for gold.", "Paid today."],
  ["Cash for silver.", "Paid today."],
] as const

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotionSafe()
  const [lit, setLit] = useState(0)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.16])

  return (
    <section className="hero" id="hero" ref={ref} aria-labelledby="hero-title">
      <motion.div
        className="hero__media frame"
        style={reduce ? undefined : { scale }}
        initial={reduce ? false : { clipPath: "inset(16% 10% 16% 10%)" }}
        animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
        transition={{ duration: 1.35, ease }}
      >
        <HeroCarousel onLit={setLit} />
      </motion.div>
      <div className="hero__shade" aria-hidden="true" />
      <div className="hero__content">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 72, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.95, delay: reduce ? 0 : 0.15, ease }}
        >
          <FrostedPlate>
            <span className="plate__rule" aria-hidden="true" />
            <h1 id="hero-title" className="green-title hero-title" aria-live="off">
              {headlines.map((lines, index) => (
                <span
                  key={lines[0]}
                  className={index === lit ? "is-on" : ""}
                  aria-hidden={index === lit ? undefined : true}
                >
                  {lines[0]}
                  <br />
                  {lines[1]}
                </span>
              ))}
            </h1>
            <p className="lede">
              Fair price in Broadview. Walk in or text us a photo.
            </p>
            <CallTextPair size="lg" tone="hero" />
          </FrostedPlate>
        </motion.div>
      </div>
    </section>
  )
}
