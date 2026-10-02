export const PAGE_SIZE = 20

export function parsePage(value: string | undefined): number {
  const page = Number.parseInt(value ?? '1', 10)
  return Number.isFinite(page) && page > 0 ? Math.min(page, 10_000) : 1
}
