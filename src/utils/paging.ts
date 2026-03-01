import type { Paging } from '../types/paging.js'

export function parsePaging(query: Record<string, string | undefined>): { limit: number; offset: number } {
  const limitRaw = query.limit
  const offsetRaw = query.offset

  const limit = clampInt(limitRaw, 10, 1, 100)
  const offset = clampInt(offsetRaw, 0, 0, 1_000_000)

  return { limit, offset }
}

function clampInt(value: string | undefined, fallback: number, min: number, max: number): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  const i = Math.trunc(n)
  if (i < min) return min
  if (i > max) return max
  return i
}

export function makePaging(limit: number, offset: number, total: number): Paging {
  return { limit, offset, total }
}