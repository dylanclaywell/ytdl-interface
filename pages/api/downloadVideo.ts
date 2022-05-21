import { exec } from 'child_process'
import { NextApiHandler } from 'next'
import path from 'path'

import logger from '../../lib/logger'
import { DownloadVideoArgs } from '../../types/downloadVideo'
import fieldIsValid, { ValidateArgs } from '../../utils/fieldIsValid'

const argsValidation: ValidateArgs<keyof DownloadVideoArgs>[] = [
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

function areValidDownloadVideoArgs(
  queuedVideoArgs: unknown
): queuedVideoArgs is DownloadVideoArgs {
  return argsValidation.every((arg) =>
    fieldIsValid({ ...arg, object: queuedVideoArgs })
  )
}

async function downloadVideo(video: DownloadVideoArgs) {
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

  const video = req.body

  if (!areValidDownloadVideoArgs(video)) {
    logger.log('error', 'Invalid args')
    return res.status(400).json({ message: 'Invalid args' })
  }

  const errors: string[] = []

  await downloadVideo(video)

  const response = { message: 'OK', errors }

  logger.log(
    'debug',
    `/api/queueVideos response: ${JSON.stringify(response, null, 2)}`
  )

  res.status(200).json(response)
}

export default handler
