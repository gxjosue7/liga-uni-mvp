const isDev = process.env.NODE_ENV !== 'production'

// Um valor que não é Error nunca propaga seu conteúdo cru: pode carregar dado
// pessoal ou detalhe do banco. Só o tipo e um código seguro, se houver.
function describe(value: unknown): string {
  if (value instanceof Error) return `${value.name}: ${value.message}`
  if (typeof value === 'object' && value !== null && 'code' in value) {
    return `código ${String(value.code)}`
  }
  return typeof value
}

export const logger = {
  info(message: string) {
    if (isDev) console.info(message)
  },
  warn(message: string) {
    if (isDev) console.warn(message)
  },
  error(message: string, error?: unknown) {
    console.error(error === undefined ? message : `${message} ${describe(error)}`)
  },
}
