import { phoneDisplay, phoneSms, phoneTel } from "../content/site"

type Size = "md" | "lg"
type Tone = "hero" | "short"

export function CallTextPair({
  size = "md",
  tone = "short",
}: {
  size?: Size
  tone?: Tone
}) {
  const sizeClass = size === "lg" ? "btn--lg" : ""
  const callLabel = tone === "hero" ? `Call ${phoneDisplay}` : "Call"
  const textLabel = "Send Text"

  return (
    <div className="cta-row">
      <a
        className={`btn btn--fill ${sizeClass}`}
        href={phoneTel}
        {...(tone === "short" ? { "aria-label": `Call ${phoneDisplay}` } : {})}
      >
        {callLabel}
      </a>
      <a
        className={`btn btn--outline ${sizeClass}`}
        href={phoneSms}
        {...(tone === "short" ? { "aria-label": "Send Text" } : {})}
      >
        {textLabel}
      </a>
    </div>
  )
}
