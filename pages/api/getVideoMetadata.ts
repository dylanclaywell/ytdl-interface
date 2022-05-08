import { NextApiHandler } from 'next'
import { exec } from 'child_process'

import {
  GetVideoMetadataResponse,
  YtdlFormat,
  YtdlMetadata,
} from '../../types/getVideoMetadata'
import { parseDuration } from '../../utils/parseDuration'
import { parseFileSize } from '../../utils/parseFileSize'

function isObject(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj)
}

type ValidType =
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'symbol'
  | 'undefined'
  | 'object'
  | 'function'
  | 'array'

function isValidType({
  fieldName,
  isNullable,
  value,
  type,
  validator,
}: {
  fieldName: string
  isNullable?: boolean
  value: unknown
  type: ValidType | ValidType[]
  validator?: (object: unknown) => void
}): boolean {
  if (isNullable && value === null) {
    return true
  }

  console.log(
    type,
    type === 'array' &&
      Array.isArray(value) &&
      validator &&
      value.every(validator)
  )

  if (
    type === 'array' &&
    !(Array.isArray(value) && validator && value.every(validator))
  ) {
    console.error(`array ${fieldName} is not valid`)
    return false
  } else if (
    type !== 'array' &&
    typeof type === 'string' &&
    typeof value !== type
  ) {
    console.error(`${fieldName} is not type ${type}`)
    return false
  }

  if (Array.isArray(type) && !type.includes(typeof value)) {
    console.error(`${fieldName} is not in type ${type.join(' | ')}`)
    return false
  }

  return true
}

function fieldIsValid({
  fieldName,
  object,
  isNullable,
  type,
  validator,
}: {
  fieldName: string
  object: unknown
  isNullable?: boolean
  type: ValidType | ValidType[]
  validator?: (object: unknown) => void
}): boolean {
  if (!isObject(object)) {
    console.error('Not an object')
    return false
  }

  if (!(fieldName in object)) {
    console.error(`${fieldName} is not in object`)
    return false
  }

  const value = object[fieldName]

  if (!isValidType({ fieldName, validator, isNullable, value, type })) {
    console.error(`${fieldName} type is not valid`)
    return false
  }

  return true
}

interface FormatValidation {
  fieldName: keyof YtdlFormat
  type: ValidType | ValidType[]
  isNullable?: boolean
}
const formatValidation: FormatValidation[] = [
  {
    fieldName: 'filesize',
    type: ['string', 'number'],
    isNullable: true,
  },
  {
    fieldName: 'format',
    type: 'string',
  },
  {
    fieldName: 'format_id',
    type: 'string',
  },
]

function isValidFormat(format: unknown): format is YtdlFormat {
  return formatValidation.every((validation) =>
    fieldIsValid({
      fieldName: validation.fieldName,
      type: validation.type,
      object: format,
      isNullable: validation.isNullable,
    })
  )
}

interface MetadataValidation {
  fieldName: keyof YtdlMetadata
  type: ValidType | ValidType[]
  isNullable?: boolean
  validator?: (object: unknown) => void
}
const metadataValidation: MetadataValidation[] = [
  {
    fieldName: 'title',
    type: 'string',
  },
  {
    fieldName: 'description',
    type: 'string',
  },
  {
    fieldName: 'formats',
    type: 'array',
    validator: isValidFormat,
  },
]

function isValidMetadata(metadata: unknown): metadata is YtdlMetadata {
  return metadataValidation.every((validation) =>
    fieldIsValid({
      fieldName: validation.fieldName,
      type: validation.type,
      object: metadata,
      isNullable: validation.isNullable,
      validator: validation.validator,
    })
  )
}

async function getVideoMetadata(url: string) {
  return new Promise<YtdlMetadata>((resolve, reject) => {
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
