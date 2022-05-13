import { NextApiHandler } from 'next'

import logger from '../../lib/logger'

const handler: NextApiHandler = async (req, res) => {
  logger.log(
    'debug',
    `Request: /api/queueVideos args: ${JSON.stringify(req.body, null, 2)}`
  )

  if (req.method !== 'GET') {
    logger.log(
      'error',
      `/api/queueVideos invalid HTTP method: expected GET; received ${req.method}`
    )
    return res.status(400).json({ message: 'Invalid request' })
  }

  const response = { message: 'OK' }

  logger.log(
    'debug',
    `/api/queueVideos response: ${JSON.stringify(response, null, 2)}`
  )

  res.status(200).json(response)
}
