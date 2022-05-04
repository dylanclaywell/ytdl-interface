import { NextApiHandler } from 'next'
import axios from 'axios'
import { GetVideoTitleResponse } from '../../types/getVideoTitle'

const handler: NextApiHandler<GetVideoTitleResponse> = async (req, res) => {
  const url = req.query.url

  if (!url || Array.isArray(url)) {
    return res.status(400).json({ message: 'Invalid request (1)' })
  }

  const response = await axios.get(url)

  const title = response.data
    .match(/<title>(.*)<\/title>/)[1]
    ?.split(' - YouTube')[0]

  if (!title) {
    return res.status(500).json({ message: 'Could not get title' })
  }

  res.status(200).json({
    title,
  })
}

export default handler
