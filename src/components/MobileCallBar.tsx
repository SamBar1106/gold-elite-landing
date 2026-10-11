import { phoneDisplay, phoneSms, phoneTel } from "../content/site"

export function MobileCallBar() {
  return (
    <div className="mobile-bar" role="region" aria-label="Call or text Gold Elite">
      <a className="btn btn--fill" href={phoneTel} aria-label={`Call ${phoneDisplay}`}>
        Call
      </a>
      <a className="btn btn--outline" href={phoneSms} aria-label="Send Text">
        Send Text
      </a>
    </div>
  )
}
