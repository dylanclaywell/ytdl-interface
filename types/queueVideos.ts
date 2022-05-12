export interface QueuedVideo {
  uuid: string
  youtubeId: string
  filename: string
  format: string
  extension: string
}

export interface QueueVideosArgs {
  videos: QueuedVideo[]
}
