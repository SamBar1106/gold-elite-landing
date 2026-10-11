/** Path under the Vite base. `publicPath("media/hero.mp4")` stays correct at `/` or `/gold-elite-landing/`. */
export function publicPath(path: string) {
  const base = import.meta.env.BASE_URL
  const rel = path.replace(/^\/+/, "")
  return `${base}${rel}`
}
