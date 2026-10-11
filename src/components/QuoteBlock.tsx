import { motion, useScroll, useTransform } from "motion/react"
import { useRef } from "react"
import { media } from "../content/media"
import {
  address,
  hoursLine,
  mapsUrl,
  phoneDisplay,
  phoneTel,
  whyLine,
} from "../content/site"
import { useReducedMotionSafe } from "../hooks/useReducedMotionSafe"
import { CallTextPair } from "./CallText"
import { FrostedPlate } from "./FrostedPlate"
import { LoopMedia } from "./LoopMedia"
import { Reveal } from "./Reveal"

export function QuoteBlock() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotionSafe()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  })
  const scale = useTransform(scrollYProgress, [0, 1], [1.14, 1])
  const fade = useTransform(scrollYProgress, [0, 0.45], [0.35, 1])

  return (
    <section className="quote" id="quote" ref={ref} aria-labelledby="quote-title">
      <motion.div
        className="quote__bg frame"
        style={reduce ? undefined : { scale, opacity: fade }}
      >
        <LoopMedia clip={media.cash} decorative />
      </motion.div>
      <div className="quote__shade" aria-hidden="true" />
      <div className="quote__content">
        <Reveal>
        <FrostedPlate center>
          <span className="plate__rule" aria-hidden="true" />
          <h2 id="quote-title" className="green-title">
            We buy your gold
            <br />
            &amp; silver now
          </h2>
          <p className="lede lede--center">
            Call or text {phoneDisplay}. Same number for both.
          </p>
          <a className="phone" href={phoneTel}>
            {phoneDisplay}
          </a>
          <CallTextPair size="lg" tone="short" />
          <p className="why">{whyLine}</p>
          <p className="quote__meta">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              {address}
            </a>
          </p>
          <p className="quote__meta">{hoursLine}</p>
        </FrostedPlate>
        </Reveal>
      </div>
    </section>
  )
}
