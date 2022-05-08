import { useEffect, useRef, useState } from 'react'
import classnames from 'classnames'
import { useMouse } from '../contexts/Mouse'

interface Props {
  uuid: string
  title: string | undefined
  url: string | undefined
  isHovered: boolean
  isSelected: boolean
  onMouseEnter: (uuid: string) => void
  onMouseLeave: (uuid: string) => void
  onSelect: (uuid: string) => void
  onDelete: (uuid: string) => void
}

export default function QueuedVideo({
  uuid,
  title,
  url,
  isHovered,
  isSelected,
  onSelect,
  onMouseEnter,
  onMouseLeave,
  onDelete,
}: Props) {
  const mouse = useMouse()
  const ref = useRef<HTMLButtonElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (ref.current && isDragging) {
      ref.current.style.top = `${mouse.y - ref.current.offsetHeight / 2}px`
      ref.current.style.left = `${
        mouse.x - (mouse.x - ref.current.offsetLeft)
      }px`
    }
  }, [mouse.x, mouse.y])

  return (
    <button
      ref={ref}
      key={uuid}
      className={classnames(
        'flex justify-between items-center text-left w-full p-2 hover:bg-gray-100',
        { absolute: isDragging, 'bg-gray-200 hover:bg-gray-100': isSelected }
      )}
      onClick={() => onSelect(uuid)}
      onMouseEnter={() => onMouseEnter(uuid)}
      onMouseLeave={() => onMouseLeave(uuid)}
      // Specifically putting the mouse up event handler here so that the entire video can escape dragging
      onMouseUp={() => {
        if (ref.current) {
          ref.current.style.position = ''
          ref.current.style.top = ''
          ref.current.style.left = ''
          ref.current.style.maxWidth = ''
        }

        setIsDragging(false)
      }}
    >
      <span className="flex items-center justify-center">
        <span
          className={
            'text-base text-gray-500 material-icons cursor-move flex items-center justify-center'
          }
          onMouseDown={(e) => {
            if (ref.current) {
              // Set max width to the current width so that `position: absolute` doesn't stretch the video container past its current width
              ref.current.style.maxWidth = `${
                ref.current.getBoundingClientRect().width
              }px`
            }

            setIsDragging(true)
          }}
        >
          drag_indicator
        </span>
        <span className="flex items-center justify-center">{title ?? url}</span>
      </span>

      <span
        className={classnames(
          'text-base text-gray-500 material-icons hover:bg-gray-200 w-6 h-6 flex justify-center items-center rounded-full',
          { 'text-red-600': isHovered }
        )}
        onClick={(e) => {
          e.stopPropagation()
          onDelete(uuid)
        }}
      >
        clear
      </span>
    </button>
  )
}
