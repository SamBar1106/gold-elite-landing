import type { ReactNode } from "react"

/** Tilt stays on the plate. The fill is a solid scrim so it never samples the video. */
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
