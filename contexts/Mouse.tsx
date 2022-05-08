import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useContext,
} from 'react'

interface State {
  x: number
  y: number
}

const initialState: State = {
  x: 0,
  y: 0,
}

const MouseContext = createContext<State>(initialState)

interface Props {
  children?: ReactNode
}

export function MouseProvider({ children }: Props) {
  const [state, setState] = useState<State>(initialState)

  function onMouseMove(event: MouseEvent) {
    setState({ ...state, x: event.clientX, y: event.clientY })
  }

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove)
  })

  return <MouseContext.Provider value={state}>{children}</MouseContext.Provider>
}

export function useMouse() {
  return useContext(MouseContext)
}
