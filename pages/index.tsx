import type { NextPage } from 'next'
import Head from 'next/head'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>YouTube Download</title>
        <meta name="description" content="An interface for youtube-dl" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Youtube Download</h1>
      </main>
    </div>
  )
}

export default Home
