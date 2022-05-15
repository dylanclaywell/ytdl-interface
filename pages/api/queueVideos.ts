import { NextApiHandler } from 'next'

import { getDatabase } from '../../lib/database'
import logger from '../../lib/logger'
import { startQueue } from '../../queue'
import { QueuedVideo, QueueVideosArgs } from '../../types/queueVideos'
import fieldIsValid, { ValidateArgs } from '../../utils/fieldIsValid'

const videoValidation: ValidateArgs<keyof QueuedVideo>[] = [
  {
    fieldName: 'uuid',
    type: 'string',
  },
  {
    fieldName: 'youtubeId',
    type: 'string',
  },
  {
    fieldName: 'filename',
    type: 'string',
  },
  {
    fieldName: 'format',
    type: 'string',
  },
  {
    fieldName: 'extension',
    type: 'string',
  },
]

function isValidQueuedVideo(video: unknown) {
  return videoValidation.every((v) =>
    fieldIsValid({
      object: video,
      ...v,
    })
  )
}

const argsValidation: ValidateArgs[] = [
  {
    fieldName: 'videos',
    validator: isValidQueuedVideo,
    type: 'array',
  },
]

function areValidQueuedVideoArgs(
  queuedVideoArgs: unknown
): queuedVideoArgs is QueueVideosArgs {
  return argsValidation.every((arg) =>
    fieldIsValid({ ...arg, object: queuedVideoArgs })
  )
}

const handler: NextApiHandler = async (req, res) => {
  logger.log(
    'debug',
    `Request: /api/queueVideos args: ${JSON.stringify(req.body, null, 2)}`
  )

  if (req.method !== 'POST') {
    logger.log(
      'error',
      `/api/queueVideos invalid HTTP method: expected POST; received ${req.method}`
    )
    return res.status(400).json({ message: 'Invalid request' })
  }

  const queuedVideoArgs = req.body

  if (!areValidQueuedVideoArgs(queuedVideoArgs)) {
    logger.log('error', 'Invalid args')
    return res.status(400).json({ message: 'Invalid args' })
  }

  const database = await getDatabase()
  const statement = database.prepare(
    `
    insert into videos (
      uuid,
      youtubeId,
      format,
      filename,
      extension,
      status
    ) values (
      ?, ?, ?, ?, ?, ?
    )
  `,
    (error) => {
      if (error) {
        res.status(500).json({ message: 'Could not queue videos' })
      }
    }
  )

  const errors: string[] = []

  for (const video of queuedVideoArgs.videos) {
    await new Promise<void>((resolve, reject) => {
      statement.run(
        [
          video.uuid,
          video.youtubeId,
          video.format,
          video.filename,
          video.extension,
          'Pending',
        ],
        (error) => {
          if (error) {
            const reason = (() => {
              switch (error.message) {
                case 'SQLITE_CONSTRAINT: UNIQUE constraint failed: videos.uuid':
                  return `Video with uuid ${video.uuid} already exists`
                default:
                  return 'Database error'
              }
            })()

            errors.push(`Could not queue video ${video.uuid}: ${reason}`)
          }

          resolve()
        }
      )
    })
  }

  const response = { message: 'OK', errors }

  logger.log(
    'debug',
    `/api/queueVideos response: ${JSON.stringify(response, null, 2)}`
  )

  void startQueue()

  res.status(200).json(response)
}

export default handler
