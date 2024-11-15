export enum LogLevel {
  DEBUG = 0,
  INFO  = 1,
  WARN  = 2,
  ERROR = 3,
}

const logger = {
  THRESHOLD: LogLevel.DEBUG,
  setThreshold: (threshold: LogLevel) => {
    logger.THRESHOLD = threshold;
  },
  debug: (...messages: string[]) => {
    if (logger.THRESHOLD <= LogLevel.DEBUG) console.debug(`[DEBUG]: ${messages.join(' ')}`);
  },
  info: (...messages: string[]) => {
    if (logger.THRESHOLD <= LogLevel.INFO) console.info(`[INFO]: ${messages.join(' ')}`);
  },
  warn: (...messages: string[]) => {
    if (logger.THRESHOLD <= LogLevel.WARN) console.warn(`[WARN]: ${messages.join(' ')}`);
  },
  error: (...messages: string[]) => {
    if (logger.THRESHOLD <= LogLevel.ERROR) console.error(`[ERROR]: ${messages.join(' ')}`);
  }
};

export default logger;