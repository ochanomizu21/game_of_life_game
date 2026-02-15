import { describe, it, expect, vi } from 'vitest'
import { Logger, logger, type LogLevel } from './logger'

describe('Logger', () => {
  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = Logger.getInstance()
      const instance2 = Logger.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('debug', () => {
    it('should log debug messages in development', () => {
      const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
      const instance = Logger.getInstance()

      instance.debug('Test debug message', 'TestContext')

      expect(debugSpy).toHaveBeenCalled()
      expect(debugSpy.mock.calls[0][0]).toContain('[DEBUG]')
      expect(debugSpy.mock.calls[0][0]).toContain('Test debug message')
      expect(debugSpy.mock.calls[0][0]).toContain('[TestContext]')

      debugSpy.mockRestore()
    })

    it('should include timestamp in debug messages', () => {
      const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
      const instance = Logger.getInstance()

      instance.debug('Test message')

      const message = debugSpy.mock.calls[0][0]
      expect(message).toMatch(/\[\d{4}-\d{2}-\d{2}T[\d:.]+Z\]/)

      debugSpy.mockRestore()
    })
  })

  describe('info', () => {
    it('should log info messages', () => {
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
      const instance = Logger.getInstance()

      instance.info('Test info message', 'TestContext')

      expect(infoSpy).toHaveBeenCalled()
      expect(infoSpy.mock.calls[0][0]).toContain('[INFO]')
      expect(infoSpy.mock.calls[0][0]).toContain('Test info message')
      expect(infoSpy.mock.calls[0][0]).toContain('[TestContext]')

      infoSpy.mockRestore()
    })
  })

  describe('warn', () => {
    it('should log warning messages', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const instance = Logger.getInstance()

      instance.warn('Test warning message', 'TestContext')

      expect(warnSpy).toHaveBeenCalled()
      expect(warnSpy.mock.calls[0][0]).toContain('[WARN]')
      expect(warnSpy.mock.calls[0][0]).toContain('Test warning message')
      expect(warnSpy.mock.calls[0][0]).toContain('[TestContext]')

      warnSpy.mockRestore()
    })
  })

  describe('error', () => {
    it('should log error messages', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const instance = Logger.getInstance()

      instance.error('Test error message', null, 'TestContext')

      expect(errorSpy).toHaveBeenCalled()
      expect(errorSpy.mock.calls[0][0]).toContain('[ERROR]')
      expect(errorSpy.mock.calls[0][0]).toContain('Test error message')
      expect(errorSpy.mock.calls[0][0]).toContain('[TestContext]')

      errorSpy.mockRestore()
    })

    it('should append error object to message', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const instance = Logger.getInstance()

      const testError = new Error('Test error')
      instance.error('Test message', testError)

      const message = errorSpy.mock.calls[0][0]
      expect(message).toContain('Test message: Error: Test error')

      errorSpy.mockRestore()
    })

    it('should log error stack in development', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const instance = Logger.getInstance()

      const testError = new Error('Test error')
      testError.stack = 'Test stack trace'

      instance.error('Test message', testError)

      expect(errorSpy).toHaveBeenCalledTimes(2)
      expect(errorSpy.mock.calls[1][0]).toBe('Test stack trace')

      errorSpy.mockRestore()
    })
  })

  describe('formatMessage', () => {
    it('should format message with all components', () => {
      const instance = Logger.getInstance()
      const message = (
        instance as unknown as {
          formatMessage: (level: LogLevel, message: string, context?: string) => string
        }
      ).formatMessage('debug', 'Test message', 'Context')

      expect(message).toMatch(/\[\d{4}-\d{2}-\d{2}T[\d:.]+Z\]/)
      expect(message).toContain('[DEBUG]')
      expect(message).toContain('[Context]')
      expect(message).toContain('Test message')
    })

    it('should format message without context', () => {
      const instance = Logger.getInstance()
      const message = (
        instance as unknown as {
          formatMessage: (level: LogLevel, message: string, context?: string) => string
        }
      ).formatMessage('info', 'Test message')

      expect(message).toContain('[INFO]')
      expect(message).toContain('Test message')
      expect(message).not.toContain('[]')
    })
  })
})

describe('logger export', () => {
  it('should export singleton logger instance', () => {
    expect(logger).toBeInstanceOf(Logger)
  })
})
