'use client'

import { useMemo } from 'react'

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function MockQRCode({
  value,
  size = 88,
  className,
}: {
  value: string
  size?: number
  className?: string
}) {
  const modules = useMemo(() => {
    const rand = mulberry32(
      Array.from(value).reduce((acc, char) => acc * 31 + char.charCodeAt(0), 7),
    )
    const grid: boolean[][] = []
    for (let row = 0; row < 21; row++) {
      grid[row] = []
      for (let col = 0; col < 21; col++) {
        grid[row][col] = rand() > 0.52
      }
    }
    const finder = (row: number, col: number) => {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const rr = row + r
          const cc = col + c
          if (rr < 0 || rr > 20 || cc < 0 || cc > 20) continue
          const border = r === -1 || r === 7 || c === -1 || c === 7
          const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4
          grid[rr][cc] = border || inner
        }
      }
    }
    finder(0, 0)
    finder(0, 14)
    finder(14, 0)
    return grid
  }, [value])

  const cell = size / 21

  return (
    <div
      className={className}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`QR code for ${value}`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
        <rect width={size} height={size} fill="#fff" />
        {modules.map((row, r) =>
          row.map((filled, c) =>
            filled ? (
              <rect
                key={`${r}-${c}`}
                x={c * cell}
                y={r * cell}
                width={cell}
                height={cell}
                fill="#111827"
              />
            ) : null,
          ),
        )}
      </svg>
    </div>
  )
}
