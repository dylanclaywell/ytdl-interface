import { createLogger, format, transports } from 'winston'

const customFormat = format.printf(({ timestamp, level, message }) => {
  return `[${timestamp}] ${level}    ${message}`
})

const logger = createLogger({
  level: process.env.LOG_LEVEL,
  format: format.combine(
    format.colorize({ all: true }),
    format.timestamp(),
    customFormat
  ),
  transports: [new transports.Console()],
})

export default logger
