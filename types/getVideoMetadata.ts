export interface YtdlFormat {
  filesize: number
  format: string
  format_id: string
  ext: string
}

export interface YtdlMetadata {
  title: string
  description: string
  duration: string
  formats: YtdlFormat[]
}

export interface Status {
  message: string
}

export interface Format {
  fileSize: string
  fileSizeInBytes: number
  name: string
  id: string
  extension: string
}

export interface Metadata {
  title: string
  description: string
  duration: string
  durationInMilliseconds: number
  availableFormats: Format[]
}

export type GetVideoMetadataResponse = Metadata | Status
