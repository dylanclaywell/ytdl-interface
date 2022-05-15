import { QueuedVideoStatus } from './queueVideos'

export interface QueuedVideo {
  uuid: string
  status: QueuedVideoStatus
}

export interface GetQueueStatusResponse {
  videos: QueuedVideo[]
}
