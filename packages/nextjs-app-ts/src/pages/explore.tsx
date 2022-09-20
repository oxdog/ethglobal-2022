import Head from 'next/head'
import { FC } from 'react'
import { ExplorePage } from '~~/components/explore/ExplorePage'
import { Layout } from '~~/components/Layout'

const Page: FC = () => {
  return (
    <>
      <Head>
        <title>🥪 Home </title>
        <meta name="description" content="Home of your Supersubs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <ExplorePage />
      </Layout>
    </>
  )
}

export default Page
