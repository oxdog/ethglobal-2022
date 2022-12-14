import Head from 'next/head'
import React from 'react'

interface ProtectedPageProps {
  authorized: boolean
}

export const ProtectedPage: React.FC<ProtectedPageProps> = ({ authorized }) => {
  return (
    <div>
      <Head>
        <title>🥪 Protected </title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="h-screen flex justify-center">
        {authorized ? (
          <div className="w-full max-w-4xl pt-24">gm world</div>
        ) : (
          <div className="w-full max-w-4xl pt-24">unauthorized</div>
        )}
      </div>
    </div>
  )
}

export default ProtectedPage
