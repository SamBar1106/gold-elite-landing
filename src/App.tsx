import { useEffect } from "react"
import { ReactLenis } from "lenis/react"
import { MarbleField } from "./components/MarbleField"
import { CashFlash } from "./components/CashFlash"
import { Hero } from "./components/Hero"
import { HowItWorks } from "./components/HowItWorks"
import { MobileCallBar } from "./components/MobileCallBar"
import { QuoteBlock } from "./components/QuoteBlock"
import { Gleam } from "./components/Reveal"
import { SiteFooter } from "./components/SiteFooter"
import { SiteNav } from "./components/SiteNav"
import { Visit } from "./components/Visit"
import { WhatWeBuy } from "./components/WhatWeBuy"
import { watchHeroThenWarm } from "./lib/warmMedia"

export default function App() {
  useEffect(() => watchHeroThenWarm(), [])

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.09,
        anchors: true,
        respectReducedMotion: true,
        stopInertiaOnNavigate: true,
      }}
    >
      <MarbleField />
      <a className="skip" href="#main">
        Skip to content
      </a>
      <SiteNav />
      <main id="main">
        <Hero />
        <CashFlash />
        <Gleam />
        <HowItWorks />
        <Gleam />
        <WhatWeBuy />
        <Gleam />
        <QuoteBlock />
        <Gleam />
        <Visit />
      </main>
      <SiteFooter />
      <MobileCallBar />
    </ReactLenis>
  )
}
