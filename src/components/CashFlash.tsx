import { motion, useScroll, useTransform } from "motion/react"
import { useRef } from "react"
import { media } from "../content/media"
import { useReducedMotionSafe } from "../hooks/useReducedMotionSafe"
import { FrostedPlate } from "./FrostedPlate"
import { LoopMedia } from "./LoopMedia"
import { Reveal } from "./Reveal"

export function CashFlash() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotionSafe()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  })
  const scale = useTransform(scrollYProgress, [0, 1], [1.18, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.55], [0.15, 1])

  return (
    <section className="cash" id="cash" ref={ref} aria-labelledby="cash-title">
      <motion.div
        className="cash__media frame"
        style={reduce ? undefined : { scale, opacity }}
      >
        <LoopMedia clip={media.cash} decorative />
      </motion.div>
      <div className="cash__shade" aria-hidden="true" />
      <div className="cash__content">
        <Reveal>
        <FrostedPlate center>
          <span className="plate__rule" aria-hidden="true" />
          <h2 id="cash-title" className="green-title cash__title">
            Cash today.
          </h2>
        </FrostedPlate>
        </Reveal>
      </div>
    </section>
  )
}
