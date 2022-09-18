/* eslint-disable unused-imports/no-unused-vars-ts */

import { Framework } from '@superfluid-finance/sdk-core'
import { useEthersAdaptorFromProviderOrSigners, useSignerAddress } from 'eth-hooks'
import { useEthersAppContext } from 'eth-hooks/context'
import { asEthersAdaptor } from 'eth-hooks/functions'
import { Signer } from 'ethers'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { FC, ReactElement, useState } from 'react'

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
import { useClearCookiesOnDisconnect } from '~~/hooks/useClearCookiesOnDisconnect'
import { useLoadUserOnWalletConnect } from '~~/hooks/useLoadUserOnWalletConnect'
import { useScaffoldHooksExamples } from '~~/hooks/useScaffoldHooksExamples'

import { EmojiBubble } from '../EmojiBubble'
import { Header } from '../Header'
import { ShortAddress } from '../ShortAddress'

interface iSubscriptionPageProps {
  pageName: string
  contract: string
  children?: ReactElement
}

export const SubscribePage: FC<iSubscriptionPageProps> = ({ contract }) => {
  const notificationHolder = useCreateAntNotificationHolder()

  const router = useRouter()

  useLoadUserOnWalletConnect()
  useClearCookiesOnDisconnect()

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

  useScaffoldHooksExamples(scaffoldAppProviders)
  const [myAddress] = useSignerAddress(context.signer)

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

      const result = await createFlowOperation.exec(context.signer as Signer)

      setTxMessage('⏳🥪 Creating Supersub...')
      const recipe = await context.provider?.waitForTransaction(result.hash)
      if (recipe?.status === 0) {
        setTxMessage('❌🥪 Transaction failed!')
      } else {
        if (Object.keys(router.query).includes('reactivate')) {
          setTxMessage('✅🥪 Supersub re-activated!')
        } else {
          setTxMessage('✅🥪 Supersub created!')
        }
      }
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
        <EmojiBubble emoji="🥪" />

        <h1 className="w-min text-3xl">Supersub</h1>
        <div className="flex flex-col items-center justify-center space-y-8">
          <a
            href={`https://goerli.etherscan.io/address/${contract}`}
            target="_blank"
            rel="noreferrer"
            className="no-underline group-hover:text-gray-400 tracking-wider cursor-pointer">
            <ShortAddress address={contract} />
          </a>

          {Object.keys(router.query).includes('reactivate') && (
            <div>Subscribe and your the inactive Supersub will automatically be re-activtated</div>
          )}

          {txMessage !== '' ? (
            <p className="text-2xl">{txMessage}</p>
          ) : (
            <button disabled={!context.provider} onClick={() => createFlow(contract, '58273944574335')}>
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
