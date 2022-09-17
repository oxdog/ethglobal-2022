/* eslint-disable unused-imports/no-unused-vars-ts */

import { useEthersAdaptorFromProviderOrSigners } from 'eth-hooks'
import { useEthersAppContext } from 'eth-hooks/context'
import { asEthersAdaptor } from 'eth-hooks/functions'
import Head from 'next/head'
import React from 'react'

import { Header } from '../Header'

import { Subscription } from './Subscription'

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
import { useLoadUserOnWalletConnect } from '~~/hooks/useLoadUserOnWalletConnect'
import { useAppSelector } from '~~/redux/hooks'
import { useClearCookiesOnDisconnect } from '~~/hooks/useClearCookiesOnDisconnect'

interface SubscriptionsPageProps {}

export const SubscriptionsPage: React.FC<SubscriptionsPageProps> = ({}) => {
  const notificationHolder = useCreateAntNotificationHolder()

  useLoadUserOnWalletConnect()
  useClearCookiesOnDisconnect()

  const { initiated, loading, subscriptions } = useAppSelector((state) => state.subs)

  const scaffoldAppProviders = useScaffoldAppProviders({
    targetNetwork: TARGET_NETWORK_INFO,
    connectToBurnerAutomatically: CONNECT_TO_BURNER_AUTOMATICALLY,
    localProvider: LOCAL_PROVIDER,
    mainnetProvider: MAINNET_PROVIDER,
    alchemyKey: ALCHEMY_KEY,
  })

  const context = useEthersAppContext()

  useLoadAppContracts()
  const [mainnetAdaptor] = useEthersAdaptorFromProviderOrSigners(MAINNET_PROVIDER)
  useConnectAppContracts(mainnetAdaptor)
  useConnectAppContracts(asEthersAdaptor(context))

  const Subscription_SuperApp = useAppContracts('SSA', context.chainId)

  return (
    <div>
      <Head>
        <title>🥪 Subscriptions </title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header scaffoldAppProviders={scaffoldAppProviders} />

      <div className="h-screen flex justify-center">
        <div className="w-full max-w-4xl pt-24">
          {loading ? (
            <h1>Loading...</h1>
          ) : initiated ? (
            <>
              <h1>Your subscriptions</h1>
              <div className="h-px bg-gray-200" />
              <div className="pt-16 grid grid-cols-2 gap-8">
                {subscriptions.map((s, i: number) => (
                  <Subscription subscriptions={s} key={`sub${i}`} />
                ))}
              </div>
            </>
          ) : (
            <h1>Please connect your wallet</h1>
          )}
          {}
        </div>
      </div>

      <div style={{ position: 'absolute' }}>{notificationHolder}</div>
    </div>
  )
}

export default SubscriptionsPage
