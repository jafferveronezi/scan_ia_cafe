/**
 * Simple logging system with levels and context
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  timestamp: Date;
  module: string;
  message: string;
  data?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 500;

  private isDevelopment(): boolean {
    return process.env.NODE_ENV !== 'production';
  }

  private formatMessage(module: string, message: string): string {
    return `[${module}] ${message}`;
  }

  private createEntry(level: LogLevel, module: string, message: string, data?: any): LogEntry {
    return {
      level,
      timestamp: new Date(),
      module,
      message,
      data,
    };
  }

  private addToHistory(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  private log(level: LogLevel, module: string, message: string, data?: any): void {
    const entry = this.createEntry(level, module, message, data);
    this.addToHistory(entry);

    const formatted = this.formatMessage(module, message);

    if (this.isDevelopment()) {
      switch (level) {
        case 'debug':
          console.debug(formatted, data);
          break;
        case 'info':
          console.info(formatted, data);
          break;
        case 'warn':
          console.warn(formatted, data);
          break;
        case 'error':
          console.error(formatted, data);
          break;
      }
    } else {
      // In production, only log errors and warnings
      if (level === 'error' || level === 'warn') {
        if (level === 'error') {
          console.error(formatted, data);
        } else {
          console.warn(formatted, data);
        }
      }
    }
  }

  debug(module: string, message: string, data?: any): void {
    this.log('debug', module, message, data);
  }

  info(module: string, message: string, data?: any): void {
    this.log('info', module, message, data);
  }

  warn(module: string, message: string, data?: any): void {
    this.log('warn', module, message, data);
  }

  error(module: string, message: string, error?: any, data?: any): void {
    const errorData = {
      ...data,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    };
    this.log('error', module, message, errorData);
  }

  getLogs(filter?: { level?: LogLevel; module?: string }): LogEntry[] {
    return this.logs.filter((entry) => {
      if (filter?.level && entry.level !== filter.level) return false;
      if (filter?.module && entry.module !== filter.module) return false;
      return true;
    });
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new Logger();
