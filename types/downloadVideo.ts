export interface DownloadVideoArgs {
  uuid: string
  youtubeId: string
  filename: string
  format: string
  extension: string
}

export type QueuedVideoStatus =
  | 'Pending'
  | 'In Progress'
  | 'Cancelled'
  | 'Error'
  | 'Complete'
