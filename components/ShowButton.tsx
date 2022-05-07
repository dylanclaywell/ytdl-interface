export interface Props {
  label: string
  onClick: React.MouseEventHandler<HTMLButtonElement>
}

export default function ShowButton({ label, onClick }: Props) {
  return (
    <button className="text-blue-500" onClick={onClick}>
      {label}
    </button>
  )
}
