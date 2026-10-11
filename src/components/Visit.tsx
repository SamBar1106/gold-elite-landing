import { address, hours, mapEmbed, mapsUrl, phoneDisplay, phoneSms, phoneTel } from "../content/site"
import { Reveal } from "./Reveal"

export function Visit() {
  return (
    <section className="visit" id="visit" aria-labelledby="visit-title">
      <Reveal>
        <h2 id="visit-title" className="green-title">
          Visit
        </h2>
        <p className="visit__address">{address}</p>
      </Reveal>
      <Reveal>
      <div className="visit__grid">
        <div className="map-frame">
          <iframe
            title="Map to Gold Elite at 1824 Roosevelt Rd, Broadview, IL 60155"
            src={mapEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="visit__hours" id="hours">
          <h3>Hours</h3>
          <ul className="hours">
            {hours.map((row) => (
              <li key={row.label}>
                <span>{row.label}</span>
                <span className={row.closed ? "is-closed" : ""}>{row.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      </Reveal>
      <Reveal>
      <div className="cta-strip">
        <a className="btn btn--fill btn--lg" href={phoneTel} aria-label={`Call ${phoneDisplay}`}>
          Call
        </a>
        <a className="btn btn--outline btn--lg" href={phoneSms} aria-label="Send Text">
          Send Text
        </a>
        <a className="btn btn--outline btn--lg" href={mapsUrl} target="_blank" rel="noopener noreferrer">
          Directions
        </a>
      </div>
      </Reveal>
    </section>
  )
}
