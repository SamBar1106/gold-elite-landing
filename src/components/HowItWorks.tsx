import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react"
import { useRef, useState } from "react"
import { media, type Clip } from "../content/media"
import { chapters } from "../content/site"
import { useReducedMotionSafe } from "../hooks/useReducedMotionSafe"
import { LoopMedia } from "./LoopMedia"

const clips: Record<(typeof chapters)[number]["mediaKey"], Clip> = {
  bringIn: media.bringIn,
  weigh: media.weigh,
  cashChapter: media.cashChapter,
}

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotionSafe()
  const [index, setIndex] = useState(0)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })
  const rail = useTransform(scrollYProgress, [0, 1], [0.08, 1])

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = value < 0.33 ? 0 : value < 0.66 ? 1 : 2
    setIndex((current) => (current === next ? current : next))
  })

  const active = chapters[index]

  return (
    <section className="how" id="how" ref={ref} aria-labelledby="how-title">
      <div className="how__pin">
        <div className="how__copy">
          <h2 id="how-title" className="green-title">
            How it works
          </h2>
          <div className="how__steps-wrap">
          <div className="how__rail" aria-hidden="true">
            <motion.span
              className="how__rail-fill"
              style={reduce ? undefined : { scaleY: rail }}
            />
          </div>
          <ol className="how__steps">
            {chapters.map((chapter, step) => (
              <li
                key={chapter.id}
                className={`how__step ${step === index ? "is-current" : ""}`}
              >
                {reduce ? (
                  <div className="how__inline frame">
                    <LoopMedia clip={clips[chapter.mediaKey]} />
                  </div>
                ) : null}
                <div className="how__text">
                  <p className="how__num">0{step + 1}</p>
                  <h3>{chapter.title}</h3>
                  <p className="how__body">{chapter.body}</p>
                </div>
              </li>
            ))}
          </ol>
          </div>
        </div>
        {reduce ? null : (
          <div className="how__stage frame" aria-hidden="true">
            <div key={active.id} className="how__layer is-on">
              <LoopMedia clip={clips[active.mediaKey]} />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
