import { FC } from 'react'
// @ts-expect-error
import LitJsSdk from '@lit-protocol/sdk-browser'
import Cookies from 'cookies'
import { ethers } from 'ethers'
import { GetServerSideProps } from 'next'
import { Subscription_SuperApp } from '~common/generated/contract-types'
import { SSAJson } from '~~/helpers/constants'
import Head from 'next/head'
import { Layout } from '~~/components/Layout'
import { SubstationFeedPage } from '~~/components/substation/SubstationFeedPage'

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const sub = query.sub as string
  const cookies = new Cookies(req, res)
  const jwt = cookies.get('lit-auth')

  let tierData: any[] = []

  if (!jwt) {
    return {
      props: {
        authorized: false,
        tierData,
      },
    }
  }

  const { verified, payload } = LitJsSdk.verifyJwt({ jwt })

  if (payload.baseUrl !== 'supersub_replace' || payload.path !== '/substation' || payload.extraData !== sub) {
    return {
      props: {
        authorized: false,
        tierData,
      },
    }
  }

  try {
    if (sub && ethers.utils.isAddress(sub)) {
      const provider = new ethers.providers.AlchemyProvider('goerli', process.env.NEXT_PUBLIC_KEY_ALCHEMY)
      const SSA = new ethers.Contract(sub, SSAJson.abi, provider) as Subscription_SuperApp
      const generalInfo = await SSA.generalInfo()

      const cid = generalInfo.subW3name

      if (cid) {
        const url = `https://${cid}.ipfs.w3s.link/data.json`
        const res = await fetch(url)
        tierData = await res.json()
      }
    }
  } catch (e) {
    console.error('error', e)
  }

  return {
    props: {
      authorized: verified ? true : false,
      tierData,
    },
  }
}

interface SubstationPageProps {
  authorized: boolean
  tierData: EncryptedData[]
}

export type EncryptedData = {
  tier: number
  encryptedString: string
  encryptedSymmetricKey: string
}

const Page: FC<SubstationPageProps> = ({ tierData, authorized }) => {
  return (
    <>
      <Head>
        <title>🥪 Substation </title>
        <meta name="description" content="Substation content" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <SubstationFeedPage tierData={tierData} authorized={authorized} />
      </Layout>
    </>
  )
}

export default Page
