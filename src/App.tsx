import { lazy, Suspense, useEffect, useState } from "react"
import { ReactLenis } from "lenis/react"
import { Hero } from "./components/Hero"
import { MobileCallBar } from "./components/MobileCallBar"
import { SiteNav } from "./components/SiteNav"

const BelowFold = lazy(() => import("./below"))

function DeferredRest() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const start = () => setShow(true)
    const host = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }
    if (typeof host.requestIdleCallback === "function") {
      const id = host.requestIdleCallback(start, { timeout: 1500 })
      return () => host.cancelIdleCallback?.(id)
    }
    const id = window.setTimeout(start, 400)
    return () => window.clearTimeout(id)
  }, [])

  if (!show) return null
  return (
    <Suspense fallback={null}>
      <BelowFold />
    </Suspense>
  )
}

export default function App() {
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
      <a className="skip" href="#main">
        Skip to content
      </a>
      <SiteNav />
      <main id="main">
        <Hero />
        <DeferredRest />
      </main>
      <MobileCallBar />
    </ReactLenis>
  )
}
