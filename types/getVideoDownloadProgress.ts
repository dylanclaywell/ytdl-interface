export interface GetVideoDownloadProgressArgs {
  uuid: string
  filename: string
  extension: string
}

interface SuccessResponse {
  uuid: string
  filesize: string
}

interface ErrorResponse {
  message: string
}

export type GetVideoDownloadProgress = SuccessResponse | ErrorResponse
