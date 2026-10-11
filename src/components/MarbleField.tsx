import { media } from "../content/media"
import { LoopMedia } from "./LoopMedia"

/** Portrait marble loop behind the page. Poster shows first and for reduced motion. */
export function MarbleField() {
  return (
    <div className="marble frame" aria-hidden="true">
      <LoopMedia clip={media.background} decorative defer />
      <div className="marble__shade" />
    </div>
  )
}
