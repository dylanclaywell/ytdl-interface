import { ChangeEvent, useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { v4 as generateUuid } from 'uuid'

import { GetVideoTitleResponse } from '../types/getVideoTitle'
import QueuedVideo from '../components/QueuedVideo'
import VideoDetails from '../components/VideoDetails'
import Header from '../components/Header'
import Button from '../components/Button'
import classnames from 'classnames'

interface FormFields {
  addUrl: string | undefined
}

const blankFormFields: FormFields = {
  addUrl: undefined,
}

interface Video {
  id?: string
  uuid: string
  title?: string
  url: string
}

const Home: NextPage = () => {
  const [formFields, setFormFields] = useState<FormFields>(blankFormFields)
  const [queue, setQueue] = useState<Video[]>([])
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null)

  const selectedVideo = queue.find((v) => v.uuid === selectedVideoId)

  function onFormFieldChange(
    e: ChangeEvent<HTMLInputElement>,
    fieldName: keyof FormFields
  ) {
    setFormFields({ ...formFields, [fieldName]: e.target.value })
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
      `http://localhost:3000/api/getVideoTitle?url=${encodeURIComponent(
        formFields.addUrl
      )}`,
      {
        method: 'GET',
      }
    ).then(async (data) => {
      const { title } = (await data.json()) as GetVideoTitleResponse

      if (title) {
        setQueue((q) => {
          return q.map((v) => ({
            ...v,
            ...(v.uuid === uuid && { title }),
          }))
        })
      }
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

      <main className="divide-y p-4 pb-0 h-full flex flex-col">
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
          <div className="flex-shrink border-r border-r-gray-100" />
          <section className="w-full p-4">
            {selectedVideo && (
              <VideoDetails
                id={selectedVideo.id}
                title={selectedVideo.title ?? selectedVideo.url}
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
        <Button label="Start" onClick={() => {}} variant="filled" />
      </div>
    </div>
  )
}

export default Home
