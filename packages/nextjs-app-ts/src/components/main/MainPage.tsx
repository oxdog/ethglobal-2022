/* eslint-disable unused-imports/no-unused-vars-ts */

import { GenericContract } from 'eth-components/ant/generic-contract'
import { useBalance, useEthersAdaptorFromProviderOrSigners } from 'eth-hooks'
import { useEthersAppContext } from 'eth-hooks/context'
import { asEthersAdaptor } from 'eth-hooks/functions'
import Head from 'next/head'
import React, { FC, ReactElement } from 'react'

import { MainPageFooter, MainPageHeader, createTabsAndPages, TContractPageList } from '.'

import { useLoadAppContracts, useConnectAppContracts, useAppContracts } from '~common/components/context'
import { useCreateAntNotificationHolder } from '~common/components/hooks/useAntNotification'
import { useBurnerFallback } from '~common/components/hooks/useBurnerFallback'
import { useScaffoldAppProviders } from '~common/components/hooks/useScaffoldAppProviders'
import {
  BURNER_FALLBACK_ENABLED,
  CONNECT_TO_BURNER_AUTOMATICALLY,
  ALCHEMY_KEY,
  LOCAL_PROVIDER,
  MAINNET_PROVIDER,
  TARGET_NETWORK_INFO,
} from '~~/config/app.config'
import { useScaffoldHooksExamples } from '~~/hooks/useScaffoldHooksExamples'

/** ********************************
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 * See ./config/app.config.ts for configuration, such as TARGET_NETWORK
 * See ../common/src/config/appContracts.config.ts and ../common/src/config/externalContracts.config.ts to configure your contracts
 * See pageList variable below to configure your pages
 * See ../common/src/config/web3Modal.config.ts to configure the web3 modal
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 * ******************************** */

interface IMainPageProps {
  pageName: string
  children?: ReactElement
}

/**
 * The main component
 * @returns
 */
export const MainPage: FC<IMainPageProps> = (props) => {
  const notificationHolder = useCreateAntNotificationHolder()

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
  const ethersAppContext = useEthersAppContext()

  // if no user is found use a burner wallet on localhost as fallback if enabled
  useBurnerFallback(scaffoldAppProviders, BURNER_FALLBACK_ENABLED)

  // -----------------------------
  // Load Contracts
  // -----------------------------
  // 🛻 load contracts
  useLoadAppContracts()
  // 🏭 connect to contracts for mainnet network & signer
  const [mainnetAdaptor] = useEthersAdaptorFromProviderOrSigners(MAINNET_PROVIDER)
  useConnectAppContracts(mainnetAdaptor)
  // 🏭 connec to  contracts for current network & signer
  useConnectAppContracts(asEthersAdaptor(ethersAppContext))

  // -----------------------------
  // Hooks use and examples
  // -----------------------------
  // 🎉 Console logs & More hook examples:
  // 🚦 disable this hook to stop console logs
  // 🏹🏹🏹 go here to see how to use hooks!
  useScaffoldHooksExamples(scaffoldAppProviders)

  // -----------------------------
  // These are the contracts!
  // -----------------------------

  // init contracts
  const Subscription_SuperApp = useAppContracts('SSA', ethersAppContext.chainId)
  const TokenFaucet = useAppContracts('TokenFaucet', ethersAppContext.chainId)
  // const mainnetDai = useAppContracts('DAI', NETWORKS.mainnet.chainId)

  // keep track of a variable from the contract in the local React state:
  // const [purpose, update] = useContractReader(
  //   Subscription_SuperApp,
  //   Subscription_SuperApp?.name,
  //   [],
  //   Subscription_SuperApp?.filters.SetPurpose()
  // );

  // 📟 Listen for broadcast events
  // const [setPurposeEvents] = useEventListener(Subscription_SuperApp, 'SetPurpose', 0)

  // -----------------------------
  // .... 🎇 End of examples
  // -----------------------------
  // 💵 This hook will get the price of ETH from 🦄 Uniswap:
  // const [ethPrice] = useDexEthPrice(
  //   scaffoldAppProviders.mainnetAdaptor?.provider,
  //   ethersAppContext.chainId !== 1 ? scaffoldAppProviders.targetNetwork : undefined
  // )
  const ethPrice = ''

  // 💰 this hook will get your balance
  const [yourCurrentBalance] = useBalance(ethersAppContext.account)

  // -----------------------------T
  // 📃 App Page List
  // -----------------------------
  // This is the list of tabs and their contents
  const pageList: TContractPageList = {
    mainPage: {
      name: 'Subscription_SuperApp',
      content: (
        <GenericContract
          contractName="Subscription_SuperApp"
          contract={Subscription_SuperApp}
          mainnetAdaptor={scaffoldAppProviders.mainnetAdaptor}
          blockExplorer={scaffoldAppProviders.targetNetwork.blockExplorer}
        />
      ),
    },
    pages: [
      {
        name: 'TokenFaucet',
        content: (
          <GenericContract
            contractName="TokenFaucet"
            contract={TokenFaucet}
            mainnetAdaptor={scaffoldAppProviders.mainnetAdaptor}
            blockExplorer={scaffoldAppProviders.targetNetwork.blockExplorer}
          />
        ),
      },
    ],
  }
  const { tabMenu, pages } = createTabsAndPages(pageList)
  const RouteNotFound = <h3 className="p-10 mt-10 text-xl">Route Not Found </h3>

  // -----------------------------
  // 📃 Render the react components
  // -----------------------------

  return (
    <div className="App">
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainPageHeader scaffoldAppProviders={scaffoldAppProviders} price={1} />
      {tabMenu}
      {pages[props.pageName] ?? RouteNotFound}
      <MainPageFooter scaffoldAppProviders={scaffoldAppProviders} price={1} />
      <div style={{ position: 'absolute' }}>{notificationHolder}</div>
    </div>
  )
}
