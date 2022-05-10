interface Props {
  children: React.ReactNode
  forwardRef?: React.MutableRefObject<HTMLElement | null>
}

export default function AppSection({ children, forwardRef }: Props) {
  return (
    <section
      ref={forwardRef}
      className="w-full py-4 overflow-y-auto h-[calc(100%-8.5rem)]"
    >
      {children}
    </section>
  )
}
