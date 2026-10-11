import { CashFlash } from "./components/CashFlash"
import { HowItWorks } from "./components/HowItWorks"
import { MarbleField } from "./components/MarbleField"
import { QuoteBlock } from "./components/QuoteBlock"
import { Gleam } from "./components/Reveal"
import { SiteFooter } from "./components/SiteFooter"
import { Visit } from "./components/Visit"
import { WhatWeBuy } from "./components/WhatWeBuy"

export default function BelowFold() {
  return (
    <>
      <MarbleField />
      <CashFlash />
      <Gleam />
      <HowItWorks />
      <Gleam />
      <WhatWeBuy />
      <Gleam />
      <QuoteBlock />
      <Gleam />
      <Visit />
      <SiteFooter />
    </>
  )
}
