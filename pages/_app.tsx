import '../styles/globals.css'
import type { AppProps } from 'next/app'

import { AppProvider } from '../contexts/App'
import { MouseProvider } from '../contexts/Mouse'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppProvider>
      <MouseProvider>
        <Component {...pageProps} />
      </MouseProvider>
    </AppProvider>
  )
}

export default MyApp
