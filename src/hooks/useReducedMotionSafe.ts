import { useReducedMotion } from "motion/react"
import { useState } from "react"

/** True when the visitor asked for less motion. Posters replace video. */
export function useReducedMotionSafe() {
  const motionPref = useReducedMotion()
  const [mediaPref] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )
  return motionPref === true || mediaPref
}
