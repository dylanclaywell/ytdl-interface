import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useContext,
} from 'react'

interface State {
  rootFontSize: number
}

const initialState: State = {
  rootFontSize: 16,
}

const AppContext = createContext<State>(initialState)

interface Props {
  children?: ReactNode
}

export function AppProvider({ children }: Props) {
  const [state, setState] = useState<State>(initialState)

  useEffect(() => {
    const fontSize = window
      .getComputedStyle(document.body)
      .getPropertyValue('font-size')
    setState({ ...state, rootFontSize: Number(fontSize.split('px')[0] ?? 16) })
  }, [])

  return <AppContext.Provider value={state}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}
