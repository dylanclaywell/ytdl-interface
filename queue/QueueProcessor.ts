import { getDatabase } from '../lib/database'
import logger from '../lib/logger'
import { QueuedVideo } from '../types/queueVideos'

export default class QueueProcessor {
  downloadInProgress = false

  async start() {
    this.downloadInProgress = true

    const database = await getDatabase()

    database.each(
      `
      select youtubeId, format, filename, extension from videos where status = 'Pending'
    `,
      (error, row: QueuedVideo) => {
        if (error) {
          logger.log('error', `Error downloading video`)
          return
        }

        logger.log('debug', `Downloading video ${row.youtubeId}`)

        logger.log('debug', ``)
      },
      (error, count) => {
        logger.log('debug', `Downloading complete - processed ${count} videos`)
      }
    )
  }
}
