interface ConfettiOptions {
  particleCount?: number
  startVelocity?: number
  spread?: number
  ticks?: number
  zIndex?: number
  origin?: {
    x?: number
    y?: number
  }
}

interface Window {
  confetti: (options?: ConfettiOptions) => void
}

declare const confetti: (options?: ConfettiOptions) => void
  