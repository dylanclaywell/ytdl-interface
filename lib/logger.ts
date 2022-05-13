import { createLogger, format, transports } from 'winston'
import path from 'path'

const customFormat = format.printf(({ timestamp, level, message }) => {
  return `[${timestamp}] ${level}    ${message}`
})

const logger = createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.timestamp(),
        customFormat
      ),
    }),
    new transports.File({
      filename: path.resolve(__dirname, '../../../../debug.log'),
      level: 'debug',
      format: format.combine(format.timestamp(), customFormat),
    }),
  ],
})

export default logger
