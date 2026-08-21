export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDev: boolean = process.env.NODE_ENV !== 'production';

  private format(tag: string, message: string): string {
    const timestamp = new Date().toISOString().substring(11, 19);
    return `[${timestamp}] [${tag}] ${message}`;
  }

  info(tag: string, message: string, ...args: unknown[]) {
    console.log(this.format(tag, message), ...args);
  }

  warn(tag: string, message: string, ...args: unknown[]) {
    console.warn(this.format(tag, message), ...args);
  }

  error(tag: string, message: string, ...args: unknown[]) {
    console.error(this.format(tag, message), ...args);
  }

  debug(tag: string, message: string, ...args: unknown[]) {
    if (this.isDev) {
      console.debug(this.format(tag, message), ...args);
    }
  }
}

export const logger = new Logger();
