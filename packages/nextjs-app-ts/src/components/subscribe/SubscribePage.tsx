/* eslint-disable unused-imports/no-unused-vars-ts */

import { Framework } from '@superfluid-finance/sdk-core'
import { useEthersAdaptorFromProviderOrSigners } from 'eth-hooks'
import { useEthersAppContext } from 'eth-hooks/context'
import { asEthersAdaptor } from 'eth-hooks/functions'
import { Signer } from 'ethers'
import Head from 'next/head'
import { FC, ReactElement, useState } from 'react'

import { Header } from '../Header'

import { useAppContracts, useConnectAppContracts, useLoadAppContracts } from '~common/components/context'
import { useCreateAntNotificationHolder } from '~common/components/hooks/useAntNotification'
import { useScaffoldAppProviders } from '~common/components/hooks/useScaffoldAppProviders'
import {
  ALCHEMY_KEY,
  CONNECT_TO_BURNER_AUTOMATICALLY,
  LOCAL_PROVIDER,
  MAINNET_PROVIDER,
  TARGET_NETWORK_INFO,
} from '~~/config/app.config'

interface iSubscriptionPageProps {
  pageName: string
  contract: string
  children?: ReactElement
}

export const SubscribePage: FC<iSubscriptionPageProps> = ({ contract }) => {
  const notificationHolder = useCreateAntNotificationHolder()

  const [txMessage, setTxMessage] = useState<string>('')

  // -----------------------------
  // Providers, signers & wallets
  // -----------------------------
  // 🛰 providers
  // see useLoadProviders.ts for everything to do with loading the right providers
  const scaffoldAppProviders = useScaffoldAppProviders({
    targetNetwork: TARGET_NETWORK_INFO,
    connectToBurnerAutomatically: CONNECT_TO_BURNER_AUTOMATICALLY,
    localProvider: LOCAL_PROVIDER,
    mainnetProvider: MAINNET_PROVIDER,
    alchemyKey: ALCHEMY_KEY,
  })

  // 🦊 Get your web3 ethers context from current providers
  const context = useEthersAppContext()

  // -----------------------------
  // Load Contracts
  // -----------------------------
  // 🛻 load contracts
  useLoadAppContracts()
  // 🏭 connect to contracts for mainnet network & signer
  const [mainnetAdaptor] = useEthersAdaptorFromProviderOrSigners(MAINNET_PROVIDER)
  useConnectAppContracts(mainnetAdaptor)
  // 🏭 connec to  contracts for current network & signer
  useConnectAppContracts(asEthersAdaptor(context))

  // init contracts
  const Subscription_SuperApp = useAppContracts('SSA', context.chainId)

  const createFlow = async (receiver: string, flowRate: string) => {
    setTxMessage('⏳🥪 Waiting for confirmation...')

    const sf = await Framework.create({
      chainId: 5,
      provider: context.provider,
    })

    const DAIxContract = await sf.loadSuperToken('fDAIx')
    const DAIx = DAIxContract.address

    try {
      const createFlowOperation = sf.cfaV1.createFlow({
        flowRate: flowRate,
        receiver,
        superToken: DAIx,
        // userData?: string
      })

      console.log('Creating your stream...')

      const result = await createFlowOperation.exec(context.signer as Signer)
      console.log(result)

      console.log(
        `
          Congrats - you've just created a money stream!
            View Your Stream At: https://app.superfluid.finance/dashboard/${receiver}
            Network: Goerli
            Super Token: DAIx
            Sender: 0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721
            Receiver: ${receiver},
            FlowRate: ${flowRate}
      `
      )

      console.log('Waiting for TX to complete')

      setTxMessage('⏳🥪 Creating Supersub...')
      await context.provider?.waitForTransaction(result.hash)
      setTxMessage('✅🥪 Supersub created!')

      // setTimeout(function () {
      //   setTxMessage('')
      // }, 4000)
    } catch (error: any) {
      console.log(
        "Hmmm, your transaction threw an error. Make sure that this stream does not already exist, and that you've entered a valid Ethereum address!"
      )
      console.error(error)

      if (error.code === 4001) {
        setTxMessage('❌🥪 Cancelled Supersub!')
      } else {
        setTxMessage('An error occured')
      }

      setTimeout(function () {
        setTxMessage('')
      }, 4000)
    }
  }

  return (
    <div className="App">
      <Head>
        <title>🥪 Subscribe</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header scaffoldAppProviders={scaffoldAppProviders} />

      <div className="w-screen h-screen flex flex-col items-center justify-center">
        <div className="text-5xl bg-gray-200 rounded-full h-24 w-24 flex items-center justify-center pb-1 shadow-md shadow-cyan-400">
          🥪
        </div>
        <h1 className="w-min text-3xl">Supersub</h1>
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="text-gray-400">{contract}</div>
          {txMessage !== '' ? (
            <p className="text-2xl">{txMessage}</p>
          ) : (
            <button disabled={!context.provider} onClick={() => createFlow(contract, '10000000')}>
              {!context.provider ? 'Connect Wallet' : 'Subscribe'}
            </button>
          )}
        </div>
      </div>

      {/* <SubscribePageFooter scaffoldAppProviders={scaffoldAppProviders} /> */}
      <div style={{ position: 'absolute' }}>{notificationHolder}</div>
    </div>
  )
}