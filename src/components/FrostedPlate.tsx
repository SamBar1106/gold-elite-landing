import type { ReactNode } from "react"

/**
 * Tilt and blur live on the same element. A child blur inside a transformed
 * parent only paints the scrim, which is why the plate looked like a flat card.
 */
export function FrostedPlate({
  children,
  center = false,
}: {
  children: ReactNode
  center?: boolean
}) {
  return (
    <div className="plate-scene">
      <div className={`plate ${center ? "plate--center" : ""}`}>
        <div className="plate__body">{children}</div>
      </div>
    </div>
  )
}
