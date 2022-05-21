import { NextApiHandler } from 'next'
import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'

import logger from '../../lib/logger'
import {
  GetVideoDownloadProgress,
  GetVideoDownloadProgressArgs,
} from '../../types/getVideoDownloadProgress'

function areValidArgs(args: {
  uuid?: string | string[]
  filename?: string | string[]
  extension?: string | string[]
}): args is GetVideoDownloadProgressArgs {
  for (const key of Object.keys(args)) {
    const value = args[key as keyof typeof args]
    if (!value) {
      logger.log(
        'error',
        `/api/getVideoDownloadProgress ${key} is required; received ${value}`
      )
      return false
    }

    if (typeof value !== 'string') {
      logger.log(
        'error',
        `/api/getVideoDownloadProgress ${key} must be a string; received ${value}`
      )
      return false
    }
  }

  return true
}

async function getVideoFilesize(
  uuid: string,
  filename: string,
  extension: string
) {
  return await new Promise<string>((resolve) => {
    const downloadedVideos = fs.readdirSync(
      path.resolve(__dirname, '../../../../output')
    )

    const regex = new RegExp(`^${filename}\.${extension}.*$`)

    if (downloadedVideos.some((v) => regex.test(v))) {
      const downloadVideoCommand = `wc -c "${path.resolve(
        __dirname,
        `../../../../output/${filename}.${extension}`
      )}"*`

      logger.log('debug', `Executing: ${downloadVideoCommand}`)

      exec(downloadVideoCommand, (error, stdout) => {
        if (error) {
          logger.log(
            'error',
            `Could not get get filesize for video ${uuid}: ${error.message}`
          )
          resolve('0')
        }

        const splitOutput = stdout.split(' ')

        resolve(splitOutput[0])
      })
    } else {
      resolve('0')
    }
  })
}

const handler: NextApiHandler<GetVideoDownloadProgress> = async (req, res) => {
  logger.log(
    'debug',
    `Request: /api/getVideoDownloadProgress args: ${JSON.stringify(
      req.query,
      null,
      2
    )}`
  )

  if (req.method !== 'GET') {
    logger.log(
      'error',
      `/api/getVideoDownloadProgress invalid HTTP method: expected GET; received ${req.method}`
    )
    return res.status(400).json({ message: 'Invalid request' })
  }

  const queryParams = req.query

  if (!areValidArgs(queryParams)) {
    return res.status(400).json({ message: 'Invalid request' })
  }

  const filesize = await getVideoFilesize(
    queryParams.uuid,
    queryParams.filename,
    queryParams.extension
  )

  const response = {
    uuid: queryParams.uuid,
    filesize,
  }

  logger.log(
    'debug',
    `/api/getVideoDownloadProgress response: ${JSON.stringify(
      response,
      null,
      2
    )}`
  )

  res.status(200).json(response)
}

export default handler
