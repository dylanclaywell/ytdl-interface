import React from 'react'
import Button from './Button'
import TextField from './TextField'

interface Props {
  addUrl: string | undefined
  addVideoToQueue: () => void
  onAddUrlChange: React.ChangeEventHandler<HTMLInputElement>
}

export default function Header({
  addUrl,
  addVideoToQueue,
  onAddUrlChange,
}: Props) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-xl">Youtube Download</h1>
      <div className="max-w-3xl flex-grow">
        <form className="flex space-x-4" onSubmit={(e) => e.preventDefault()}>
          <div className="flex-grow">
            <TextField
              label="URL"
              value={addUrl ?? ''}
              onChange={onAddUrlChange}
            />
          </div>
          <Button
            isDisabled={!addUrl}
            label="Add"
            onClick={addVideoToQueue}
            variant="text"
          />
        </form>
      </div>
    </div>
  )
}
