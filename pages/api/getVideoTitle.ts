import { NextApiHandler } from 'next'
import { GetVideoTitleResponse } from '../../types/getVideoTitle'
import { exec } from 'child_process'

interface Metadata {
  title: string
}

function isObject(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj)
}

function isValidMetadata(metadata: unknown): metadata is Metadata {
  return (
    isObject(metadata) &&
    'title' in metadata &&
    typeof metadata.title === 'string'
  )
}

async function getVideoMetadata(url: string) {
  return new Promise<Metadata>((resolve, reject) => {
    try {
      exec(`youtube-dl --dump-json ${url}`, (error, stdout) => {
        const metadata = JSON.parse(stdout)

        if (!isValidMetadata(metadata)) {
          throw new Error('Invalid metadata')
        }

        resolve(metadata)
      })
    } catch (e) {
      reject(e)
    }
  })
}

const handler: NextApiHandler<GetVideoTitleResponse> = async (req, res) => {
  let url = req.query.url

  if (!url || Array.isArray(url)) {
    return res.status(400).json({ message: 'Invalid request (1)' })
  }

  try {
    const metadata = await getVideoMetadata(url)

    const title = metadata.title

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
