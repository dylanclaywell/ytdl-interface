import { exec } from 'child_process'
import path from 'path'

import { getDatabase } from '../lib/database'
import logger from '../lib/logger'
import { QueuedVideo, QueuedVideoStatus } from '../types/queueVideos'

export default class QueueProcessor {
  downloadInProgress = false

  async updateQueuedVideoStatus(uuid: string, status: QueuedVideoStatus) {
    const database = await getDatabase()

    await new Promise<void>((resolve) => {
      database.run(
        `update videos set status = ? where uuid = ?`,
        [status, uuid],
        (result: any, error: any) => {
          if (error) {
            logger.log('error', `Could not update the status for video ${uuid}`)
            resolve()
          }

          logger.log('debug', `Updated the status for video ${uuid}`)

          resolve()
        }
      )
    })
  }

  async downloadVideo(video: QueuedVideo) {
    await new Promise<void>((resolve) => {
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
  }

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

      await this.updateQueuedVideoStatus(video.uuid, 'In Progress')

      await this.downloadVideo(video)

      await this.updateQueuedVideoStatus(video.uuid, 'Complete')

      logger.log('debug', `Downloading video ${video.uuid} completed`)
    }

    this.downloadInProgress = false

    logger.log('debug', `Downloading complete - processed  videos`)
  }
}
