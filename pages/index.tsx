import { ChangeEvent, useEffect, useRef, useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { v4 as generateUuid } from 'uuid'
import classnames from 'classnames'

import { Format, GetVideoMetadataResponse } from '../types/getVideoMetadata'
import {
  QueueVideosArgs,
  QueuedVideo as QueuedVideoArg,
} from '../types/queueVideos'
import QueuedVideo from '../components/QueuedVideo'
import VideoDetails from '../components/VideoDetails'
import Header from '../components/Header'
import Button from '../components/Button'
import AppSection from '../components/AppSection'
import { parseDuration } from '../utils/parseDuration'
import { parseFileSize } from '../utils/parseFileSize'
import { sortFormats } from '../utils/sortFormats'

interface FormFields {
  addUrl: string | undefined
}

const blankFormFields: FormFields = {
  addUrl: undefined,
}

interface Video {
  uuid: string
  id?: string
  description?: string
  title?: string
  url: string
  fileSize?: string
  duration?: string
  durationInMilliseconds?: number
  availableFormats?: Format[]
  selectedFormat?: Format
  sortOrder: number
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
  const [draggingVideoElement, setDraggingVideoElement] =
    useState<DraggingVideo | null>(null)
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null)

  const selectedVideo = queue.find((v) => v.uuid === selectedVideoId)
  const draggingVideo = queue.find((v) => v.uuid === draggingVideoElement?.uuid)

  const totalDuration = parseDuration(
    queue.reduce((acc, val) => {
      acc += val.durationInMilliseconds ?? 0
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
      id,
      url: formFields.addUrl,
      sortOrder: queue.length + 1,
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
        return q.map((v) => ({
          ...v,
          ...(v.uuid === uuid && {
            ...videoMetadataResponse,
            selectedFormat:
              videoMetadataResponse.availableFormats?.sort(sortFormats)[0],
          }),
        }))
      })
    })

    setFormFields((fields) => ({ ...fields, addUrl: undefined }))
    setQueue((q) => [...q, video])
  }

  function deleteVideo(uuid: string) {
    setQueue((q) => q.filter((v) => v.uuid !== uuid))
  }

  async function submitVideos() {
    const videos = queue.reduce<QueuedVideoArg[]>((acc, video) => {
      if (
        !video.title ||
        !video.selectedFormat?.name ||
        !video.selectedFormat?.extension ||
        !video.id
      ) {
        return acc
      }

      const formattedVideo: QueuedVideoArg = {
        extension: video.selectedFormat.extension,
        filename: video.title,
        format: video.selectedFormat.id,
        uuid: video.uuid,
        youtubeId: video.id,
      }

      acc.push(formattedVideo)

      return acc
    }, [])

    await fetch('/api/queueVideos', {
      method: 'POST',
      body: JSON.stringify({ videos }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  useEffect(() => {
    if (queue.length) {
      localStorage.setItem('ytdlQueue', JSON.stringify(queue))
    }
  }, [queue])

  useEffect(() => {
    const newQueue = JSON.parse(localStorage.getItem('ytdlQueue') ?? '[]')
    setQueue(newQueue)
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
                    onMouseEnter={() => setHoveredVideoId(video.uuid)}
                    onMouseLeave={() => setHoveredVideoId(null)}
                    onMouseDown={(uuid, ref) =>
                      setDraggingVideoElement({ uuid, ref })
                    }
                    onMouseUp={(uuid) => setDraggingVideoElement(null)}
                    title={video.title}
                    url={video.url}
                    uuid={video.uuid}
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
                title={selectedVideo.title ?? selectedVideo.url}
                description={selectedVideo.description}
                fileSize={selectedVideo.fileSize}
                duration={selectedVideo.duration}
                availableFormats={selectedVideo.availableFormats}
                onFormatChange={onVideoFormatChange}
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
        <Button label="Start" onClick={submitVideos} variant="filled" />
      </div>
    </div>
  )
}

export default Home
