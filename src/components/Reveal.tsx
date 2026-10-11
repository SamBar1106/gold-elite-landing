import { motion } from "motion/react"
import type { ReactNode } from "react"
import { useReducedMotionSafe } from "../hooks/useReducedMotionSafe"

const ease = [0.22, 1, 0.36, 1] as const

export function Reveal({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const reduce = useReducedMotionSafe()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 72, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.85, ease }}
    >
      {children}
    </motion.div>
  )
}

/** Gold seam that draws across as the next section arrives. */
export function Gleam() {
  const reduce = useReducedMotionSafe()
  return (
    <motion.div
      className="gleam"
      aria-hidden="true"
      initial={reduce ? false : { scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 0.9, ease }}
    />
  )
}
