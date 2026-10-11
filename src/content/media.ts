import { publicPath } from "../lib/publicPath"

export type Clip = {
  poster: string
  /** Present only when the matching mp4 was uploaded. */
  src?: string
  alt: string
}

/**
 * Public paths under /media. Originals live in the upload set; see README media map.
 * Cash-same-visit reuses the vault clip so the chapter actually moves.
 */
export const media = {
  logo: publicPath("media/logo.png"),
  background: {
    poster: publicPath("media/website-background.jpg"),
    src: publicPath("media/website-background.mp4"),
    alt: "Black marble with gold veins",
  } satisfies Clip,
  hero: {
    poster: publicPath("media/hero.jpg"),
    src: publicPath("media/hero.mp4"),
    alt: "Inside the Gold Elite shop",
  } satisfies Clip,
  goldStorefront: {
    poster: publicPath("media/gold-storefront.webp"),
    src: publicPath("media/gold-storefront.mp4"),
    alt: "Gold Elite storefront",
  } satisfies Clip,
  silverTumble: {
    poster: publicPath("media/silver-tumble.webp"),
    src: publicPath("media/silver-tumble.mp4"),
    alt: "Silver poured onto the scale and paid in cash",
  } satisfies Clip,
  cash: {
    poster: publicPath("media/cash.jpg"),
    src: publicPath("media/cash.mp4"),
    alt: "Cash and gold coins",
  } satisfies Clip,
  bringIn: {
    poster: publicPath("media/bring-in.jpg"),
    src: publicPath("media/bring-in.mp4"),
    alt: "Jewelry brought in to Gold Elite",
  } satisfies Clip,
  weigh: {
    poster: publicPath("media/weigh.jpg"),
    src: publicPath("media/weigh.mp4"),
    alt: "Scale used to weigh gold and silver",
  } satisfies Clip,
  cashChapter: {
    poster: publicPath("media/cash.jpg"),
    src: publicPath("media/cash.mp4"),
    alt: "Cash paid on the same visit",
  } satisfies Clip,
  chains: {
    poster: publicPath("media/chains.jpg"),
    src: publicPath("media/chains.mp4"),
    alt: "Gold chains",
  } satisfies Clip,
  rings: {
    poster: publicPath("media/rings.jpg"),
    src: publicPath("media/rings.mp4"),
    alt: "Gold rings",
  } satisfies Clip,
  scrap: {
    poster: publicPath("media/scrap.jpg"),
    src: publicPath("media/scrap.mp4"),
    alt: "Scrap gold",
  } satisfies Clip,
  bars: {
    poster: publicPath("media/bars.jpg"),
    src: publicPath("media/bars.mp4"),
    alt: "Gold bars",
  } satisfies Clip,
} as const
