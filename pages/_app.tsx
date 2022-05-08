import '../styles/globals.css'
import type { AppProps } from 'next/app'

import { MouseProvider } from '../contexts/Mouse'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MouseProvider>
      <Component {...pageProps} />
    </MouseProvider>
  )
}

export default MyApp
