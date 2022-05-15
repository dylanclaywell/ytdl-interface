import { NextApiHandler } from 'next'
import { exec } from 'child_process'
import path from 'path'

import { getDatabase } from '../../lib/database'
import logger from '../../lib/logger'
import {
  GetQueueStatusResponse,
  DBQueuedVideo,
  QueuedVideo,
} from '../../types/getQueueStatus'

async function getQueuedVideos() {
  const database = await getDatabase()
  return await new Promise<DBQueuedVideo[]>((resolve) => {
    database.all(
      `select uuid, filename, extension, status from videos`,
      (error, rows: DBQueuedVideo[]) => {
        if (error) {
          resolve([])
        }

        resolve(rows)
      }
    )
  })
}

async function getVideoFilesize(
  uuid: string,
  filename: string,
  extension: string
) {
  return await new Promise<string>((resolve) => {
    exec(
      `ls -lh "${path.resolve(
        __dirname,
        `../../../../output/${filename}.${extension}`
      )}"*`,
      (error, stdout) => {
        if (error) {
          logger.log(
            'error',
            `Could not get get filesize for video ${uuid}: ${error.message}`
          )
        }

        const splitOutput = stdout.split(' ')

        resolve(splitOutput[4])
      }
    )
  })
}

const handler: NextApiHandler<GetQueueStatusResponse> = async (req, res) => {
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

  const queuedVideos = await getQueuedVideos()

  const videos: QueuedVideo[] = []

  for (const video of queuedVideos) {
    const filesize = await getVideoFilesize(
      video.uuid,
      video.filename,
      video.extension
    )

    videos.push({
      uuid: video.uuid,
      status: video.status,
      filesize,
    })
  }

  const response = { videos }

  logger.log(
    'debug',
    `/api/getQueueStatus response: ${JSON.stringify(response, null, 2)}`
  )

  res.status(200).json(response)
}

export default handler
