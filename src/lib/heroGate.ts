let started = false
const waiters = new Set<() => void>()

/** Below-fold video waits until the hero has actually begun playback. */
export function afterHeroPlaying(run: () => void) {
  if (started) {
    run()
    return () => {}
  }
  waiters.add(run)
  return () => {
    waiters.delete(run)
  }
}

export function notifyHeroPlaying() {
  if (started) return
  started = true
  waiters.forEach((run) => run())
  waiters.clear()
}
