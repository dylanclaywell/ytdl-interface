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
      className={classnames(
        'h-11 font-bold uppercase tracking-widest px-4 duration-200 rounded-md',
        {
          'text-cyan-700 hover:bg-cyan-700 hover:text-white  disabled:text-gray-300 disabled:hover:bg-transparent':
            variant === 'text',
          'bg-cyan-700 text-white hover:bg-cyan-800 disabled:bg-gray-400 disabled:hover:bg-gray-400':
            variant === 'filled',
        }
      )}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
