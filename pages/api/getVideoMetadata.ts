import { NextApiHandler } from 'next'
import { exec } from 'child_process'

import {
  GetVideoMetadataResponse,
  Metadata,
  YtdlFormat,
  YtdlMetadata,
} from '../../types/getVideoMetadata'
import { parseDuration } from '../../utils/parseDuration'
import { parseFileSize } from '../../utils/parseFileSize'

function isObject(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj)
}

function isValidFormat(format: unknown): format is YtdlFormat {
  return (
    isObject(format) &&
    'format' in format &&
    typeof format.format === 'string' &&
    'filesize' in format &&
    typeof format.filesize === 'number' &&
    'format_id' in format &&
    typeof format.format_id === 'string'
  )
}

function isValidMetadata(metadata: unknown): metadata is YtdlMetadata {
  return (
    isObject(metadata) &&
    'title' in metadata &&
    typeof metadata.title === 'string' &&
    'description' in metadata &&
    typeof metadata.description === 'string' &&
    'formats' in metadata &&
    Array.isArray(metadata.formats) &&
    metadata.formats.every((format) => isValidFormat(format))
  )
}

async function getVideoMetadata(url: string) {
  return new Promise<YtdlMetadata>((resolve, reject) => {
    try {
      exec(`youtube-dl --dump-json ${url}`, (error, stdout) => {
        const metadata = JSON.parse(stdout)

        // console.log(Object.keys(metadata))
        // console.log(metadata.formats, {
        //   upload_date: metadata.upload_date,
        //   uploader: metadata.uploader,
        //   format: metadata.format,
        //   blah: Object.values(metadata.formats).find(
        //     (f) => f.format_id === '140'
        //   ),
        // })

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

const handler: NextApiHandler<GetVideoMetadataResponse> = async (req, res) => {
  let url = req.query.url

  if (!url || Array.isArray(url)) {
    return res.status(400).json({ message: 'Invalid request (1)' })
  }

  try {
    const metadata = await getVideoMetadata(url)

    const { title, description, duration, formats } = metadata

    return res.status(200).json({
      title,
      description,
      duration: parseDuration(Number(duration)),
      durationInMilliseconds: Number(duration),
      availableFormats: formats.map((format) => ({
        fileSizeInBytes: format.filesize,
        fileSize: parseFileSize(format.filesize),
        name: `${format.format} - ${format.ext} - ${(
          format.filesize /
          1000 /
          1000
        ).toFixed(2)}MB`,
        id: format.format_id,
      })),
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: 'Could not get title' })
  }
}

export default handler
