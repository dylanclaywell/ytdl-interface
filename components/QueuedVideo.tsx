import classnames from 'classnames'

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
  return (
    <button
      key={uuid}
      className="flex justify-between items-center text-left w-full p-2 hover:bg-gray-100"
      onClick={() => onSelect(uuid)}
      onMouseEnter={() => onMouseEnter(uuid)}
      onMouseLeave={() => onMouseLeave(uuid)}
    >
      {title ?? url}
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
