import { exec } from 'child_process'
import path from 'path'

import { getDatabase } from '../lib/database'
import logger from '../lib/logger'
import { QueuedVideo } from '../types/queueVideos'

export default class QueueProcessor {
  downloadInProgress = false

  async start() {
    logger.log('debug', 'Starting video queue')

    this.downloadInProgress = true

    const database = await getDatabase()

    const queuedVideos = await new Promise<QueuedVideo[]>((resolve, reject) =>
      database.all(
        `
      select uuid, youtubeId, format, filename, extension from videos where status = 'Pending'
    `,
        (error: any, rows: QueuedVideo[]) => {
          if (error) {
            logger.log('error', `Error downloading videos`)
            reject()
          }

          resolve(rows)
        }
      )
    )

    for (const video of queuedVideos) {
      logger.log('debug', `Downloading video ${video.uuid}`)

      logger.log(
        'debug',
        `Exec: youtube-dl ${video.youtubeId} -f ${
          video.format
        } -o ${path.resolve(
          __dirname,
          `../../../../output/${video.filename}.${video.extension}`
        )}`
      )

      await new Promise<void>((resolve, reject) => {
        exec(
          `youtube-dl ${video.youtubeId} -f ${video.format} -o "${path.resolve(
            __dirname,
            `../../../../output/${video.filename}.${video.extension}`
          )}"`,
          (error) => {
            if (error) {
              logger.log(
                'error',
                `Error downloading video ${video.uuid}: ${error.message}`
              )
              resolve()
            }

            resolve()
          }
        )
      })

      logger.log('debug', `Downloading video ${video.uuid} completed`)
    }

    logger.log('debug', `Downloading complete - processed  videos`)
  }
}
