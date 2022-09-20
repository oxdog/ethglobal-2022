import { ethers } from 'ethers'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { Subscription_SuperApp } from '~common/generated/contract-types'
import { Layout } from '~~/components/Layout'

import { SubscribePage } from '~~/components/subscribe/SubscribePage'
import { SSAJson, SUBSTATION_WHITELIST } from '~~/helpers/constants'

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const sub = query.sub as string
  let subInfo = {
    name: '',
    address: '',
  }

  try {
    if (!SUBSTATION_WHITELIST.includes(sub)) {
      throw Error('invalid address')
    }

    if (sub && ethers.utils.isAddress(sub)) {
      const provider = new ethers.providers.AlchemyProvider('goerli', process.env.NEXT_PUBLIC_KEY_ALCHEMY)
      const SSA = new ethers.Contract(sub, SSAJson.abi, provider) as Subscription_SuperApp
      const generalInfo = await SSA.generalInfo()

      subInfo = {
        name: generalInfo.subName,
        address: SSA.address,
      }
    }
  } catch (e) {
    console.error('error', e)
  } finally {
    return {
      props: {
        subInfo,
      },
    }
  }
}

export type SubInfo = {
  name: string
  address: string
}

interface SubscribePageProps {
  subInfo: SubInfo
}

const Page: React.FC<SubscribePageProps> = ({ subInfo }) => {
  return (
    <>
      <Head>
        <title>🥪 Subscribe </title>
        <meta name="description" content="Subscribe here" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <SubscribePage subInfo={subInfo} />
      </Layout>
    </>
  )
}

export default Page
