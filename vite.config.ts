import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

/** Project Pages path. Set VITE_BASE=/ (or BASE_PATH=/) when a custom domain serves the site at the root. */
function siteBase() {
  const raw = process.env.VITE_BASE ?? process.env.BASE_PATH
  if (raw === undefined) return "/gold-elite-landing/"
  const trimmed = raw.trim()
  if (trimmed === "" || trimmed === "/") return "/"
  const withLead = trimmed.startsWith("/") ? trimmed : `/${trimmed}`
  return withLead.endsWith("/") ? withLead : `${withLead}/`
}

function withBase(base: string, path: string) {
  return `${base}${path.replace(/^\/+/, "")}`
}

const POSTERS = ["/media/logo.png", "/media/hero.jpg"]

/** Writes dist/sw.js with the hashed shell files from this build. */
function serviceWorker(): Plugin {
  return {
    name: "gold-elite-sw",
    apply: "build",
    generateBundle(_options, bundle) {
      const base = siteBase()
      const shell = new Set<string>([withBase(base, "index.html"), ...POSTERS.map((path) => withBase(base, path))])
      const rooted = (full: string) => {
        if (base !== "/" && !full.startsWith(base)) return null
        const rel = base === "/" ? full : `/${full.slice(base.length)}`
        return rel.startsWith("/") ? rel : `/${rel}`
      }
      for (const item of Object.values(bundle)) {
        if (item.type === "chunk" && item.isEntry && item.fileName.endsWith(".js")) {
          shell.add(withBase(base, item.fileName))
        }
        if (item.type === "asset" && item.fileName.endsWith(".css")) {
          shell.add(withBase(base, item.fileName))
        }
        if (item.type !== "asset") continue
        const text =
          typeof item.source === "string" ? item.source : new TextDecoder().decode(item.source)
        if (item.fileName === "index.html") {
          for (const match of text.matchAll(/(?:src|href)="([^"]+)"/g)) {
            const path = match[1]
            const rel = rooted(path)
            if (!rel || rel.endsWith(".mp4") || rel.endsWith(".woff")) continue
            if (rel.startsWith("/assets/") || rel.startsWith("/media/")) shell.add(path)
          }
        }
        if (item.fileName.endsWith(".css")) {
          for (const match of text.matchAll(/url\((['"]?)([^)'"]+)\1\)/g)) {
            const path = match[2]
            if (path.startsWith("data:") || path.endsWith(".woff")) continue
            const absolute = path.startsWith("/") ? path : withBase(base, path.replace(/^\.\//, ""))
            const rel = rooted(absolute)
            if (rel?.startsWith("/assets/") || rel?.startsWith("/media/")) shell.add(absolute)
          }
        }
      }
      const template = readFileSync(resolve("src/sw.js"), "utf8")
      this.emitFile({
        type: "asset",
        fileName: "sw.js",
        source: template
          .replace("__GE_BASE__", JSON.stringify(base))
          .replace("__GE_SHELL__", JSON.stringify([...shell])),
      })
    },
    writeBundle() {
      const base = siteBase()
      const htmlPath = resolve("dist/index.html")
      const fonts = readdirSync(resolve("dist/assets")).filter((name) =>
        /inter-latin-(400|700)-normal-.+\.woff2$/.test(name),
      )
      const links = fonts
        .map(
          (name) =>
            `<link rel="preload" as="font" type="font/woff2" href="${base}assets/${name}" crossorigin fetchpriority="low">`,
        )
        .join("\n    ")
      if (!links) return
      const html = readFileSync(htmlPath, "utf8")
      if (html.includes('rel="preload" as="font"')) return
      writeFileSync(htmlPath, html.replace("</head>", `    ${links}\n  </head>`))
    },
  }
}

export default defineConfig({
  base: siteBase(),
  plugins: [react(), serviceWorker()],
  build: {
    // Keep both prefixed and unprefixed declarations. LightningCSS minify drops one of them.
    cssMinify: false,
  },
  css: {
    lightningcss: {
      targets: {
        chrome: 120 << 16,
        edge: 120 << 16,
        firefox: 120 << 16,
        safari: (16 << 16) | (4 << 8),
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 4317,
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 4317,
    strictPort: true,
  },
})
