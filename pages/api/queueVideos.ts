import { NextApiHandler } from 'next'

import { getDatabase } from '../../lib/database'
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
  if (req.method !== 'POST') {
    return res.status(400).json({ message: 'Invalid request' })
  }

  const queuedVideoArgs = req.body

  if (!areValidQueuedVideoArgs(queuedVideoArgs)) {
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
            errors.push(`Could not queue video ${video.uuid}`)
          }

          resolve()
        }
      )
    })
  }

  res.status(200).json({ message: 'OK', errors })
}

export default handler
