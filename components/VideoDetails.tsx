import { useState } from 'react'
import classnames from 'classnames'

import { Format } from '../types/getVideoMetadata'
import { QueuedVideoStatus } from '../types/queueVideos'
import { sortFormats } from '../utils/sortFormats'
import ShowButton from './ShowButton'

interface Props {
  id: string | undefined
  uuid: string
  title: string
  description: string | undefined
  duration: string | undefined
  fileSize: string | undefined
  availableFormats: Format[] | undefined
  status: QueuedVideoStatus
  onFormatChange: (uuid: string, format: Format) => void
  selectedFormat: Format | undefined
}

export default function VideoDetails({
  id,
  uuid,
  title,
  description,
  fileSize,
  duration,
  availableFormats,
  status,
  onFormatChange,
  selectedFormat,
}: Props) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="ml-4">
      <div className="w-full flex justify-center flex-col items-center overflow-y-auto">
        <img
          className="w-full max-w-[30rem]"
          src={`http://img.youtube.com/vi/${id}/0.jpg`}
        />
      </div>
      <h2 className="mt-8 mb-4 text-2xl">{title}</h2>
      <div
        className={classnames('py-2 px-4 mb-4 rounded-full w-fit', {
          'bg-cyan-500': status === 'In Progress',
          'bg-gray-200': status === 'Pending' || status === 'Cancelled',
          'bg-red-500': status === 'Error',
          'bg-green-500': status === 'Complete',
        })}
      >
        {status}
      </div>
      <span>{duration}</span>
      <br />
      <span>{fileSize}</span>
      <h3 className="mt-4 font-bold">Selected Format</h3>
      <select
        value={selectedFormat?.id}
        onChange={(e) => {
          const format = availableFormats?.find(
            (format) => format.id === e.target.value
          )

          if (format) {
            onFormatChange(uuid, format)
          }
        }}
      >
        {availableFormats?.sort(sortFormats).map((format) => (
          <option key={`select-option-${format.id}`} value={format.id}>
            {format.name}
          </option>
        ))}
      </select>
      <h3 className="mt-4 font-bold">Description</h3>
      <ShowButton
        onClick={() => setShowDetails((show) => !show)}
        label={showDetails ? 'Hide -' : 'Show +'}
      />
      {showDetails && <p className="whitespace-pre-wrap">{description}</p>}
    </div>
  )
}
