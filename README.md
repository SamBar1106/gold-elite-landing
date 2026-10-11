# Gold Elite

Landing page for Gold Elite, a cash buyer of gold and silver at 1824 Roosevelt Rd, Broadview, IL. Walk-in quotes. Call or text (708) 345-8905.

Vite, React, and TypeScript. Smooth scroll is Lenis. Section motion is Motion. “What we buy” is an Embla carousel.

## Run

```bash
npm install
npm run dev
```

Dev server: [http://127.0.0.1:4317/gold-elite-landing/](http://127.0.0.1:4317/gold-elite-landing/)

The default Vite `base` is `/gold-elite-landing/` so GitHub project Pages can serve the site. Set `VITE_BASE=/` when a custom domain should serve it from the root.

```bash
npm run build
npm run preview
```

`npm run lint` runs oxlint.

GitHub Actions (`.github/workflows/pages.yml`) builds `dist` and deploys it with Pages. The live project URL is [https://sambar1106.github.io/gold-elite-landing/](https://sambar1106.github.io/gold-elite-landing/).

## Page order

0. Sticky nav — logo, Call, Text, Hours, Directions
1. Hero — shop video, green headline, Call / Text on a frosted plate
2. Cash flash — vault rain
3. How it works — three chapters (sticky split on desktop, stacked on small screens)
4. What we buy — Embla cards: chains, rings, scrap, bars
5. Quote — phone, Call / Text, address, hours
6. Visit — map embed, hours, Call / Text / Directions

On viewports under 1024px, Call and Text stay in a fixed bottom bar (44px+ targets). Desktop keeps those actions in the nav and on the hero and quote plates.

Titles and primary buttons use `#22C55E`, with a `#39FF14` glow on hover and title shadow. Plates over video use CSS perspective, a slight `rotateX` / `translateZ`, and `backdrop-filter` blur with a dark scrim.

`prefers-reduced-motion: reduce` skips Lenis smoothing, scroll scrubs, and video. Those visitors get posters only.

## Media map

Files in `public/media/` come from the locked upload set.

| Slot | Served as | Source upload | Notes |
| --- | --- | --- | --- |
| Logo | `logo.png` | `IMG_3481.PNG` | Lion crest. Trimmed and resized for the header. |
| Marble field | `website-background.mp4` + `.jpg` | `website_background.mp4`, `website_background_poster_c63a.jpg` | Fixed muted loop behind the page. |
| Hero | `hero.mp4` + `hero.jpg` | `generated_video_3.mp4`, `generated_video_3_poster` | Shop interior. Poster paints first. |
| Cash flash | `cash.mp4` + `cash.jpg` | `generated_video_6.mp4`, `generated_video_6_poster` | Vault / cash rain. |
| Bring it in | `bring-in.mp4` + `.jpg` | `generated_video_1.mp4`, poster | Muted loop. |
| We test & weigh | `weigh.mp4` + `.jpg` | `generated_video_2.mp4`, poster | Muted loop. |
| Cash same visit | `cash.mp4` + `cash.jpg` | same vault clip | Chapter theater and the quote backdrop. |
| Chains | `chains.mp4` + `.jpg` | `gemini_generated_video_eb46c1b2.mp4` | Muted loop. |
| Rings | `rings.mp4` + `.jpg` | `gemini_generated_video_8e6d750e.mp4` | Muted loop. |
| Scrap | `scrap.mp4` + `.jpg` | `generated_video.mp4` | Muted loop. |
| Bars | `bars.mp4` + `.jpg` | `gemini_generated_video_f18d7321.mp4` | Muted loop. |

Every clip is muted, looping, and plays inline. The poster is the first paint. `prefers-reduced-motion` keeps the poster and does not start video.

The visit map is a Google Maps embed for the street address (no API key). Directions also open Google Maps.
