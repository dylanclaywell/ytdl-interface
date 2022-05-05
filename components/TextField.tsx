import { useId } from 'react'
import classnames from 'classnames'

interface Props {
  value: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  label: string
}

export default function TextField({ value, onChange, label }: Props) {
  const id = useId()

  return (
    <div className="relative">
      <input
        id={id}
        className="border w-full border-gray-400 rounded-md p-2 h-11"
        value={value}
        onChange={onChange}
      />
      <label
        className={classnames(
          'text-gray-400 absolute top-1/2 -translate-y-1/2 left-2',
          {
            hidden: value,
          }
        )}
        htmlFor={id}
      >
        {label}
      </label>
    </div>
  )
}
