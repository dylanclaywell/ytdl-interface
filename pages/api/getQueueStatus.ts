import { NextApiHandler } from 'next'

import { getDatabase } from '../../lib/database'
import logger from '../../lib/logger'
import { QueuedVideo } from '../../types/getQueueStatus'

const handler: NextApiHandler = async (req, res) => {
  logger.log(
    'debug',
    `Request: /api/getQueueStatus args: ${JSON.stringify(req.body, null, 2)}`
  )

  if (req.method !== 'GET') {
    logger.log(
      'error',
      `/api/getQueueStatus invalid HTTP method: expected GET; received ${req.method}`
    )
    return res.status(400).json({ message: 'Invalid request' })
  }

  const database = await getDatabase()

  const videos = await new Promise<QueuedVideo[]>((resolve) => {
    database.all(
      `select uuid, status from videos`,
      (error, rows: QueuedVideo[]) => {
        if (error) {
          resolve([])
        }

        resolve(rows)
      }
    )
  })

  const response = { videos }

  logger.log(
    'debug',
    `/api/getQueueStatus response: ${JSON.stringify(response, null, 2)}`
  )

  res.status(200).json(response)
}

export default handler
