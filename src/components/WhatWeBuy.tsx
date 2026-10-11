import useEmblaCarousel from "embla-carousel-react"
import { useCallback, useEffect, useState } from "react"
import { media, type Clip } from "../content/media"
import { buyCards, buyLine } from "../content/site"
import { LoopMedia } from "./LoopMedia"
import { Reveal } from "./Reveal"

const clips: Record<(typeof buyCards)[number]["mediaKey"], Clip> = {
  chains: media.chains,
  rings: media.rings,
  scrap: media.scrap,
  bars: media.bars,
}

export function WhatWeBuy() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
  })
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)
  const [selected, setSelected] = useState(0)
  const [count, setCount] = useState<number>(buyCards.length)

  const sync = useCallback(() => {
    if (!emblaApi) return
    setCanPrev(emblaApi.canScrollPrev())
    setCanNext(emblaApi.canScrollNext())
    setSelected(emblaApi.selectedScrollSnap())
    setCount(emblaApi.scrollSnapList().length)
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on("select", sync)
    emblaApi.on("reInit", sync)
    const frame = requestAnimationFrame(sync)
    return () => {
      cancelAnimationFrame(frame)
      emblaApi.off("select", sync)
      emblaApi.off("reInit", sync)
    }
  }, [emblaApi, sync])

  return (
    <section className="buy" id="buy" aria-labelledby="buy-title">
      <Reveal>
        <div className="buy__head">
          <div>
            <h2 id="buy-title" className="green-title">
              What we buy
            </h2>
            <p className="buy__line">{buyLine}</p>
          </div>
          <div className="buy__controls">
            <p className="buy__count" aria-live="polite">
              {selected + 1} / {count}
            </p>
            <button
              type="button"
              className="icon-btn"
              aria-label="Previous category"
              disabled={!canPrev}
              onClick={() => emblaApi?.scrollPrev()}
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="Next category"
              disabled={!canNext}
              onClick={() => emblaApi?.scrollNext()}
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </Reveal>
      <div
        className="buy__viewport"
        ref={emblaRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Chains, rings, scrap, and bars"
      >
        <div className="buy__track">
          {buyCards.map((card) => (
            <article className="buy-card" key={card.id} aria-label={card.title}>
              <div className="buy-card__media frame">
                <LoopMedia clip={clips[card.mediaKey]} />
              </div>
              <h3 className="green-title">{card.title}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
