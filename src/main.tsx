import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@fontsource/inter/latin-400.css"
import "@fontsource/inter/latin-500.css"
import "@fontsource/inter/latin-600.css"
import "@fontsource/inter/latin-700.css"
import "lenis/dist/lenis.css"
import App from "./App.tsx"
import "./index.css"

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  const base = import.meta.env.BASE_URL
  void navigator.serviceWorker.register(`${base}sw.js`, { scope: base })
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
