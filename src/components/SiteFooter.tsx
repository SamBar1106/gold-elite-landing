import { media } from "../content/media"
import { address, hoursLine, phoneDisplay, phoneTel } from "../content/site"
import { Reveal } from "./Reveal"

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Reveal>
      <img src={media.logo} alt="" width={512} height={478} />
      <p className="site-footer__name">Gold Elite</p>
      <p>{address}</p>
      <p>{hoursLine}</p>
      <p>
        <a href={phoneTel}>{phoneDisplay}</a>
      </p>
      </Reveal>
    </footer>
  )
}
