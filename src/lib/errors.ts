export type AppErrorCode = 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'INVALID'

export class AppError extends Error {
  readonly code: AppErrorCode

  constructor(code: AppErrorCode, message: string) {
    super(message)
    this.name = 'AppError'
    this.code = code
  }
}

export class ValidationError extends AppError {
  readonly fieldErrors: Record<string, string[]>

  constructor(fieldErrors: Record<string, string[]>, message = 'Confira os campos destacados.') {
    super('INVALID', message)
    this.name = 'ValidationError'
    this.fieldErrors = fieldErrors
  }
}
