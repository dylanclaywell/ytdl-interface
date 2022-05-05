interface Props {
  id: string | undefined
  title: string
}

export default function VideoDetails({ id, title }: Props) {
  return (
    <>
      <div className="w-full flex justify-center flex-col items-center overflow-y-auto">
        <img
          className="w-full max-w-[30rem]"
          src={`http://img.youtube.com/vi/${id}/0.jpg`}
        />
      </div>
      <h2 className="mt-8 text-2xl">{title}</h2>
    </>
  )
}
