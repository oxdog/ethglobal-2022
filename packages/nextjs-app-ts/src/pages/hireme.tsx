import Head from 'next/head'
import { FC } from 'react'
import { Layout } from '~~/components/Layout'

const Page: FC = () => {
  return (
    <>
      <Head>
        <title>🥪 oxdog is for hire </title>
        <meta name="description" content="Home of your Supersubs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="space-y-8 text-xl pt-24">
          <div className="text-4xl font-bold tracking-widest">GM GM</div>
          <div>
            <div>
              My name is <b>oxdog</b>,
            </div>
            <div>I created this Demo when competing at EthGlobal and want to tell you</div>
          </div>

          <div className="text-3xl font-bold tracking-widest uppercase">I am for hire!</div>

          <div className="text-gray-300">
            <div>Fullstack Web3 developer</div>
            <div>Stack Typescript, React, Solidity, NextJS, etc. </div>
          </div>

          <div className="space-y-2">
            <div className="text-xl font-bold tracking-widest uppercase">Feel free to reach out</div>
            <div className="flex items-start space-x-12">
              <div>
                <div>Discord</div>
                <div>oxdog.eth🏴#9626</div>
              </div>
              <div>
                <div>Twitter </div>
                <a href="https://twitter.com/the_oxdog" target="_blank" rel="noreferrer">
                  @the_oxdog
                </a>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

export default Page
