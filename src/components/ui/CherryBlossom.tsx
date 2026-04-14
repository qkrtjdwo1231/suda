'use client'

import { useMemo } from 'react'

const PETAL_COUNT = 18

interface Petal {
  id: number
  left: number       // vw %
  size: number       // px
  duration: number   // s
  delay: number      // s
  sway: number       // px
  rotation: number   // deg
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

export default function CherryBlossom() {
  const petals = useMemo<Petal[]>(() => {
    return Array.from({ length: PETAL_COUNT }, (_, i) => ({
      id: i,
      left: randomBetween(0, 100),
      size: randomBetween(8, 16),
      duration: randomBetween(6, 12),
      delay: randomBetween(0, 10),
      sway: randomBetween(40, 100),
      rotation: randomBetween(0, 360),
    }))
  }, [])

  return (
    <div className="cherry-blossom-container" aria-hidden="true">
      {petals.map((p) => (
        <div
          key={p.id}
          className="petal"
          style={{
            left: `${p.left}vw`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            '--sway': `${p.sway}px`,
            '--rotation': `${p.rotation}deg`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
