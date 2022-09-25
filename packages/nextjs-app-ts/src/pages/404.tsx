import Head from 'next/head'
import { FC } from 'react'

const Page: FC = () => {
  return (
    <>
      <Head>
        <title>🥪 404 </title>
        <meta name="description" content="Home of your Supersubs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="space-y-8 text-xl pt-24">
        <div className="text-4xl font-bold tracking-widest">404</div>
      </div>
    </>
  )
}

export default Page
