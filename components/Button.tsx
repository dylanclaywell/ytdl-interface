import classnames from 'classnames'

interface Props {
  onClick: React.MouseEventHandler<HTMLButtonElement>
  label: string
  variant?: 'text' | 'filled'
  isDisabled?: boolean
}

export default function ({
  onClick,
  label,
  variant = 'filled',
  isDisabled = false,
}: Props) {
  return (
    <button
      disabled={isDisabled}
      className={classnames({
        'text-cyan-700 font-bold uppercase tracking-widest px-4 hover:bg-cyan-700 hover:text-white duration-200 rounded-md disabled:text-gray-500 disabled:hover:bg-transparent':
          variant === 'text',
      })}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
