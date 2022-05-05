import { NextApiHandler } from 'next'
import axios from 'axios'
import { GetVideoTitleResponse } from '../../types/getVideoTitle'

const handler: NextApiHandler<GetVideoTitleResponse> = async (req, res) => {
  let url = req.query.url

  if (!url || Array.isArray(url)) {
    return res.status(400).json({ message: 'Invalid request (1)' })
  }

  if (!/^https:\/\/www.youtube.com\/watch\?v=\S+$/.test(url)) {
    url = `https://www.youtube.com/watch?v=${url}`
  }

  try {
    const response = await axios.get(url)
    const title = response.data
      .match(/<title>(.*)<\/title>/)[1]
      ?.split(' - YouTube')[0]

    if (!title) {
      return res.status(500).json({ message: 'Could not get title (1)' })
    }

    return res.status(200).json({
      title,
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: 'Could not get title (2)' })
  }
}

export default handler
