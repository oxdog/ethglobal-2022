import { GetServerSideProps } from 'next'
import { FC } from 'react'
import SubstationPage from '~~/components/substation/SubstationPage'

import { Framework } from '@superfluid-finance/sdk-core'
import { ethers } from 'ethers'
import _ from 'lodash'
import { Subscription_SuperApp } from '~common/generated/contract-types'
import { SSAJson } from '~~/helpers/constants'

export const getServerSideProps: GetServerSideProps = async ({}) => {
  console.log('\n\n\ngetServerSideProps')
  const provider = new ethers.providers.AlchemyProvider('goerli', process.env.NEXT_PUBLIC_KEY_ALCHEMY)
  const SSA = new ethers.Contract(SSAJson.address, SSAJson.abi, provider) as Subscription_SuperApp

  const generalInfo = await SSA.generalInfo()

  const sf = await Framework.create({
    chainId: 5,
    provider,
  })
  const DAIxContract = await sf.loadSuperToken('fDAIx')
  const flowRate = await sf.cfaV1.getNetFlow({
    account: SSA.address,
    providerOrSigner: provider,
    superToken: DAIxContract.address,
  })
  const balance = await DAIxContract.balanceOf({
    account: SSA.address,
    providerOrSigner: provider,
  })

  console.log('flowRate', flowRate)
  console.log('balance', balance)
  console.log('balanceTimestamp', Date.now())

  return {
    props: {
      substations: [
        {
          name: generalInfo.subName,
          symbol: generalInfo.subSymbol,
          address: SSA.address,
          tiers: _.map(generalInfo.subTiers, (t) => t.toString()),
          balance: balance.toString(),
          balanceTimestamp: Math.floor(Date.now() / 1000),
          flowRate: flowRate.toString(),
        },
      ],
    },
  }
}

export type TSubstation = {
  name: string
  symbol: string
  address: string
  tiers: string[]
  balance: string
  balanceTimestamp: number
  flowRate: string
}

interface SubstationPageProps {
  substations: TSubstation[]
}

const Page: FC<SubstationPageProps> = ({ substations }) => {
  return <SubstationPage substations={substations} />
}

export default Page
