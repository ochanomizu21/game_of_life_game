type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export class Logger {
  private static isDevelopment = import.meta.env.DEV
  private static instance: Logger

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? `[${context}]` : ''
    return `[${timestamp}] [${level.toUpperCase()}]${contextStr} ${message}`
  }

  debug(message: string, context?: string): void {
    if (Logger.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context))
    }
  }

  info(message: string, context?: string): void {
    console.info(this.formatMessage('info', message, context))
  }

  warn(message: string, context?: string): void {
    console.warn(this.formatMessage('warn', message, context))
  }

  error(message: string, error?: unknown, context?: string): void {
    const errorMessage = error ? `${message}: ${String(error)}` : message
    console.error(this.formatMessage('error', errorMessage, context))
    if (error instanceof Error && Logger.isDevelopment) {
      console.error(error.stack)
    }
  }
}

export const logger = Logger.getInstance()
