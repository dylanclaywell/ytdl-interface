import { ChangeEvent, useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { v4 as generateUuid } from 'uuid'

import TextField from '../components/TextField'
import Button from '../components/Button'
import { GetVideoTitleResponse } from '../types/getVideoTitle'

interface FormFields {
  addUrl: string | undefined
}

const blankFormFields: FormFields = {
  addUrl: undefined,
}

interface Video {
  id: string
  title?: string
  url: string
}

const Home: NextPage = () => {
  const [formFields, setFormFields] = useState<FormFields>(blankFormFields)
  const [queue, setQueue] = useState<Video[]>([])

  function onFormFieldChange(
    e: ChangeEvent<HTMLInputElement>,
    fieldName: keyof FormFields
  ) {
    setFormFields({ ...formFields, [fieldName]: e.target.value })
  }

  async function addVideoToQueue() {
    if (!formFields.addUrl) return

    const id = generateUuid()

    const video = {
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
            ...(v.id === id && { title }),
          }))
        })
      }
    })

    setFormFields((fields) => ({ ...fields, addUrl: undefined }))
    setQueue((q) => [...q, video])
  }

  return (
    <div className="max-w-3xl m-auto">
      <Head>
        <title>YouTube Download</title>
        <meta name="description" content="An interface for youtube-dl" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Youtube Download</h1>
        <div className="divide-y">
          <div className="pb-4 flex space-x-4">
            <div className="flex-grow">
              <TextField
                label="URL"
                value={formFields.addUrl ?? ''}
                onChange={(e) => onFormFieldChange(e, 'addUrl')}
              />
            </div>
            <Button
              isDisabled={!formFields.addUrl}
              label="Add"
              onClick={addVideoToQueue}
              variant="text"
            />
          </div>
          <div className="py-4">
            {queue.map((video) => (
              <div>{video.title ?? video.url}</div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home
