import { QueuedVideoStatus } from './queueVideos'

export interface DBQueuedVideo {
  uuid: string
  status: QueuedVideoStatus
  filename: string
  extension: string
}

export interface QueuedVideo {
  uuid: string
  status: QueuedVideoStatus
  filesize: string
}

interface SuccessResponse {
  videos: QueuedVideo[]
}

interface ErrorResponse {
  message: string
}

export type GetQueueStatusResponse = SuccessResponse | ErrorResponse
