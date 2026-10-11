import { useEffect, useState } from "react"
import { media } from "../content/media"
import { LoopMedia } from "./LoopMedia"

/** Portrait marble loop behind the page. It stays off until the hero has scrolled away. */
export function MarbleField() {
  const [play, setPlay] = useState(false)

  useEffect(() => {
    const hero = document.getElementById("hero")
    if (!hero) return
    const observer = new IntersectionObserver(
      ([entry]) => setPlay((entry?.intersectionRatio ?? 1) < 0.25),
      { threshold: [0, 0.25, 0.5] },
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="marble frame" aria-hidden="true">
      {play ? <LoopMedia clip={media.background} decorative background /> : null}
      <div className="marble__shade" />
    </div>
  )
}
