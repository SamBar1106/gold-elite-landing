import { media } from "../content/media"
import { phoneDisplay, phoneSms, phoneTel } from "../content/site"

export function SiteNav() {
  return (
    <header className="nav">
      <a className="nav__logo" href="#hero" aria-label="Gold Elite, back to top">
        <img src={media.logo} alt="" width={512} height={478} decoding="async" fetchPriority="low" />
      </a>
      <nav className="nav__bar" aria-label="Primary">
        <a className="nav__link" href="#hours">
          Hours
        </a>
        <a className="nav__link" href="#visit">
          Directions
        </a>
        <a className="btn btn--fill nav__cta" href={phoneTel} aria-label={`Call ${phoneDisplay}`}>
          Call
        </a>
        <a className="btn btn--outline nav__cta" href={phoneSms} aria-label="Send Text">
          Send Text
        </a>
      </nav>
    </header>
  )
}
