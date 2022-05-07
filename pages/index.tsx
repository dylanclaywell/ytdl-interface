import { ChangeEvent, useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { v4 as generateUuid } from 'uuid'
import classnames from 'classnames'

import { Format, GetVideoMetadataResponse } from '../types/getVideoMetadata'
import QueuedVideo from '../components/QueuedVideo'
import VideoDetails from '../components/VideoDetails'
import Header from '../components/Header'
import Button from '../components/Button'
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
}

const Home: NextPage = () => {
  const [formFields, setFormFields] = useState<FormFields>(blankFormFields)
  const [queue, setQueue] = useState<Video[]>([])
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null)

  const selectedVideo = queue.find((v) => v.uuid === selectedVideoId)

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

    const video = {
      uuid,
      id,
      url: formFields.addUrl,
    }

    fetch(
      `http://localhost:3000/api/getVideoMetadata?url=${encodeURIComponent(
        formFields.addUrl
      )}`,
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
          <section className="py-4 w-full">
            {queue.map((video) => (
              <QueuedVideo
                key={video.uuid}
                isHovered={hoveredVideoId === video.uuid}
                onSelect={() => setSelectedVideoId(video.uuid)}
                onDelete={() => deleteVideo(video.uuid)}
                isSelected={false}
                onMouseEnter={() => setHoveredVideoId(video.uuid)}
                onMouseLeave={() => setHoveredVideoId(null)}
                title={video.title}
                url={video.url}
                uuid={video.uuid}
              />
            ))}
          </section>
          <div className="flex-shrink border-r border-r-gray-200" />
          <section className="w-full p-4 overflow-y-auto h-[calc(100%-8.5rem)]">
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
          </section>
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
        <Button label="Start" onClick={() => {}} variant="filled" />
      </div>
    </div>
  )
}

export default Home
