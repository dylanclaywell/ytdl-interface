import { ChangeEvent, useEffect, useRef, useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { v4 as generateUuid } from 'uuid'
import classnames from 'classnames'

import { Format, GetVideoMetadataResponse } from '../types/getVideoMetadata'
import { DownloadVideoArgs, QueuedVideoStatus } from '../types/downloadVideo'
import QueuedVideo from '../components/QueuedVideo'
import VideoDetails from '../components/VideoDetails'
import Header from '../components/Header'
import Button from '../components/Button'
import AppSection from '../components/AppSection'
import { parseDuration } from '../utils/parseDuration'
import { parseFileSize } from '../utils/parseFileSize'
import { sortFormats } from '../utils/sortFormats'
import { GetVideoDownloadProgress } from '../types/getVideoDownloadProgress'

interface FormFields {
  addUrl: string | undefined
}

const blankFormFields: FormFields = {
  addUrl: undefined,
}

interface Video {
  uuid: string
  sortOrder: number
  url: string
  id: string
  selectedFormat: Format | undefined
  status: QueuedVideoStatus
  downloadedFilesize?: number

  metadata?: {
    description: string
    title: string
    duration: string
    durationInMilliseconds: number
    availableFormats: Format[]
  }
}

interface DraggingVideo {
  uuid: string
  ref: React.MutableRefObject<HTMLButtonElement | null>
}

const Home: NextPage = () => {
  const videoQueueForwardRef = useRef<HTMLElement>(null)
  const [formFields, setFormFields] = useState<FormFields>(blankFormFields)
  const [queue, setQueue] = useState<Video[]>([])
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [downloadingVideoId, setDownloadVideoId] = useState<string | null>(null)
  const [draggingVideoElement, setDraggingVideoElement] =
    useState<DraggingVideo | null>(null)
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const downloadingVideoRef = useRef<Video | null>(null)
  const [downloadingQueue, setDownloadingQueue] = useState<Video[] | null>(null)
  const [downloadingQueueIndex, setDownloadingQueueIndex] = useState<number>(0)

  const selectedVideo = queue.find((v) => v.uuid === selectedVideoId)
  const draggingVideo = queue.find((v) => v.uuid === draggingVideoElement?.uuid)
  const downloadingVideo = queue.find((v) => v.uuid === downloadingVideoId)

  const totalDuration = parseDuration(
    queue.reduce((acc, val) => {
      acc += val.metadata?.durationInMilliseconds ?? 0
      return acc
    }, 0)
  )

  const totalFileSize = parseFileSize(
    queue.reduce((acc, val) => {
      acc += val.selectedFormat?.fileSizeInBytes ?? 0
      return acc
    }, 0)
  )

  function onFormFieldChange(
    e: ChangeEvent<HTMLInputElement>,
    fieldName: keyof FormFields
  ) {
    setFormFields({ ...formFields, [fieldName]: e.target.value })
  }

  function onVideoFormatChange(videoUuid: string, format: Format) {
    setQueue((q) => {
      return q.map((v) => ({
        ...v,
        ...(v.uuid === videoUuid && { selectedFormat: format }),
      }))
    })
  }

  async function addVideoToQueue() {
    if (!formFields.addUrl) return

    const uuid = generateUuid()

    const id =
      formFields.addUrl.match(
        /^https:\/\/www.youtube.com\/watch\?v=(\S+)$/
      )?.[1] ?? formFields.addUrl

    const video: Video = {
      uuid,
      sortOrder: queue.length + 1,
      id,
      url: formFields.addUrl,
      selectedFormat: undefined,
      status: 'Pending',
    }

    fetch(
      `/api/getVideoMetadata?url=${encodeURIComponent(formFields.addUrl)}`,
      {
        method: 'GET',
      }
    ).then(async (data) => {
      const videoMetadataResponse =
        (await data.json()) as GetVideoMetadataResponse

      if ('message' in videoMetadataResponse) {
        console.error(videoMetadataResponse.message)
        return
      }

      setQueue((q) => {
        const newQueue = q.map((v) => ({
          ...v,
          ...(v.uuid === uuid
            ? {
                selectedFormat:
                  videoMetadataResponse.availableFormats?.sort(sortFormats)[0],
              }
            : { selectedFormat: v.selectedFormat }),
          metadata:
            v.uuid === uuid
              ? {
                  ...videoMetadataResponse,
                }
              : v.metadata,
        }))

        localStorage.setItem('ytdlQueue', JSON.stringify(newQueue))

        return newQueue
      })
    })

    setFormFields((fields) => ({ ...fields, addUrl: undefined }))
    setQueue((q) => [...q, video])
  }

  function deleteVideo(uuid: string) {
    setQueue((q) => {
      const newQueue = q.filter((v) => v.uuid !== uuid)
      localStorage.setItem('ytdlQueue', JSON.stringify(newQueue))
      return newQueue
    })
  }

  async function downloadVideo(video: Video) {
    if (!video.metadata || !video.selectedFormat) {
      return
    }

    const formattedVideo: DownloadVideoArgs = {
      extension: video.selectedFormat.extension,
      filename: video.metadata.title,
      format: video.selectedFormat.id,
      uuid: video.uuid,
      youtubeId: video.id,
    }

    await fetch('/api/downloadVideo', {
      method: 'POST',
      body: JSON.stringify(formattedVideo),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async function getDownloadVideoProgress(video: Video | null) {
    if (!video) {
      return
    }

    const videoProgress = (await (
      await fetch(
        `/api/getVideoDownloadProgress?uuid=${video.uuid}&extension=${video.selectedFormat?.extension}&filename=${video.metadata?.title}`,
        {
          headers: {
            'Cache-Control': 'no-cache',
          },
        }
      )
    ).json()) as GetVideoDownloadProgress

    if (downloadingVideoRef.current && 'uuid' in videoProgress) {
      setQueue((q) =>
        q.map((v) => ({
          ...v,
          downloadedFilesize: Number(videoProgress.filesize),
        }))
      )
    }
  }

  useEffect(() => {
    if (downloadingQueue?.length) {
      const video = downloadingQueue[downloadingQueueIndex]
      downloadingVideoRef.current = video
      setDownloadVideoId(video.uuid)
      downloadVideo(video).then(() => {
        if (downloadingQueueIndex + 1 < downloadingQueue.length) {
          setDownloadingQueueIndex((i) => i + 1)
          setQueue((q) =>
            q.map((v) => ({
              ...v,
              ...(v.uuid === video.uuid ? { status: 'Complete' as const } : {}),
            }))
          )
        } else {
          setIsDownloading(false)
          setDownloadingQueueIndex(0)
          setDownloadingQueue(null)
          setDownloadVideoId(null)
          setQueue((q) =>
            q.map((v) => ({
              ...v,
              ...(v.uuid === video.uuid ? { status: 'Complete' as const } : {}),
            }))
          )
          downloadingVideoRef.current = null
        }
      })
    }
  }, [downloadingQueue, downloadingQueueIndex])

  useEffect(() => {
    const newQueue = JSON.parse(localStorage.getItem('ytdlQueue') ?? '[]')
    setQueue(newQueue)

    const interval = setInterval(async () => {
      await getDownloadVideoProgress(downloadingVideoRef.current)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="m-auto h-screen">
      <Head>
        <title>YouTube Download</title>
        <meta name="description" content="An interface for youtube-dl" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="divide-y p-4 pb-0 h-full flex flex-col overflow-hidden">
        <Header
          addUrl={formFields.addUrl}
          addVideoToQueue={addVideoToQueue}
          onAddUrlChange={(e) => onFormFieldChange(e, 'addUrl')}
        />

        <div className="flex h-full">
          <AppSection forwardRef={videoQueueForwardRef}>
            {queue
              .sort((a, b) => (a.sortOrder < b.sortOrder ? -1 : 1))
              .map((video, index) => (
                <>
                  <QueuedVideo
                    key={video.uuid}
                    isHovered={hoveredVideoId === video.uuid}
                    onSelect={() => setSelectedVideoId(video.uuid)}
                    onDelete={() => deleteVideo(video.uuid)}
                    isSelected={selectedVideoId === video.uuid}
                    isDragging={draggingVideo?.uuid === video.uuid}
                    isDownloading={downloadingVideoId === video.uuid}
                    onMouseEnter={() => setHoveredVideoId(video.uuid)}
                    onMouseLeave={() => setHoveredVideoId(null)}
                    onMouseDown={(uuid, ref) =>
                      setDraggingVideoElement({ uuid, ref })
                    }
                    onMouseUp={(uuid) => setDraggingVideoElement(null)}
                    status={video.status}
                    title={video.metadata?.title}
                    url={video.url}
                    uuid={video.uuid}
                    totalFilesize={video.selectedFormat?.fileSizeInBytes}
                    downloadedFilesize={video.downloadedFilesize}
                  />
                  <div
                    className={classnames(
                      "fixed after:text-transparent after:content-['fake-video'] p-1 m-1 after:fixed",
                      {
                        'relative after:relative border-gray-400 bg-gray-100 border border-dashed rounded-sm':
                          draggingVideo &&
                          index === draggingVideo.sortOrder - 1,
                        'top-0 left-0':
                          !draggingVideo ||
                          index !== draggingVideo.sortOrder - 1,
                      }
                    )}
                  />
                </>
              ))}
          </AppSection>
          <div className="flex-shrink border-r border-r-gray-200" />
          <AppSection>
            {selectedVideo && (
              <VideoDetails
                id={selectedVideo.id}
                uuid={selectedVideo.uuid}
                selectedFormat={selectedVideo.selectedFormat}
                title={selectedVideo.metadata?.title ?? selectedVideo.url}
                description={selectedVideo.metadata?.description}
                fileSize={selectedVideo.selectedFormat?.fileSize}
                duration={selectedVideo.metadata?.duration}
                availableFormats={selectedVideo.metadata?.availableFormats}
                status={selectedVideo.status}
                onFormatChange={onVideoFormatChange}
                onTitleChange={(uuid: string, title: string) => {
                  setQueue((q) => {
                    const newQueue = q.map((v) => ({
                      ...v,
                      ...(v.uuid === uuid && v.metadata
                        ? {
                            metadata: { ...v.metadata, title },
                          }
                        : {}),
                    }))

                    localStorage.setItem('ytdlQueue', JSON.stringify(newQueue))

                    return newQueue
                  })
                }}
              />
            )}
          </AppSection>
        </div>
      </main>

      <div
        className={classnames(
          'flex duration-150 bg-white justify-between items-center fixed bottom-0 left-0 right-0 p-4 shadow-[0px_4px_10px_4px_rgba(0,0,0,0.4)]',
          { 'translate-y-full shadow-none': !queue.length }
        )}
      >
        <span>
          {queue.length} video{queue.length !== 1 && 's'} queued
        </span>
        <span>{totalDuration}</span>
        <span>{totalFileSize}</span>
        <Button
          label={isDownloading ? 'Downloading' : 'Start'}
          onClick={() => {
            const queuedVideos = queue.filter((v) => v.status === 'Pending')

            if (queuedVideos.length) {
              setIsDownloading(true)
              setDownloadingQueue(queuedVideos)
            }
          }}
          variant="filled"
          isDisabled={isDownloading}
        />
      </div>
    </div>
  )
}

export default Home
