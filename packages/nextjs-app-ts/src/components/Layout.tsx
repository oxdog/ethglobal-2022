import { getNetwork } from '@ethersproject/networks'
import { Dialog, Transition } from '@headlessui/react'
import { Bars3Icon, ChartBarIcon, HomeIcon } from '@heroicons/react/24/outline'
import {
  connectorErrorText,
  CouldNotActivateError,
  NoStaticJsonRPCProviderFoundError,
  useEthersAppContext,
} from 'eth-hooks/context'
import Cookies from 'js-cookie'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { Fragment, ReactElement, useCallback, useEffect, useState } from 'react'
import { BsWindow } from 'react-icons/bs'
import { GrFormClose } from 'react-icons/gr'
import { ImCompass2 } from 'react-icons/im'
import { IoMdWarning } from 'react-icons/io'
import { useAntNotification, useCreateAntNotificationHolder, useScaffoldAppProviders } from '~common/components'
import {
  ALCHEMY_KEY,
  CONNECT_TO_BURNER_AUTOMATICALLY,
  LOCAL_PROVIDER,
  MAINNET_PROVIDER,
  TARGET_NETWORK_INFO,
} from '~~/config/app.config'
import { useClearCookiesOnDisconnect } from '~~/hooks/useClearCookiesOnDisconnect'
import { useLoadUserOnWalletConnect } from '~~/hooks/useLoadUserOnWalletConnect'
import { Account } from './Account'
import { DemoModal } from './DemoModal'

const navigation = [
  { name: 'Home', route: '/', icon: HomeIcon, current: true },
  { name: 'Explore', route: '/explore', icon: ImCompass2, current: false },
  { name: 'Creator Dashboard', route: '/user/substations', icon: ChartBarIcon, current: false },
]

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

interface LayoutProps {
  children?: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const [openDemo, setOpenDemo] = useState(false)

  useEffect(() => {
    if (!Cookies.get('demoModal')) {
      setOpenDemo(true)
    }
  }, [])

  useLoadUserOnWalletConnect()
  useClearCookiesOnDisconnect()

  const scaffoldAppProviders = useScaffoldAppProviders({
    targetNetwork: TARGET_NETWORK_INFO,
    connectToBurnerAutomatically: CONNECT_TO_BURNER_AUTOMATICALLY,
    localProvider: LOCAL_PROVIDER,
    mainnetProvider: MAINNET_PROVIDER,
    alchemyKey: ALCHEMY_KEY,
  })

  const ethersAppContext = useEthersAppContext()
  const selectedChainId = ethersAppContext.chainId

  const notification = useAntNotification()
  const notificationHolder = useCreateAntNotificationHolder()

  const onLoginError = useCallback(
    (e: Error) => {
      if (e instanceof NoStaticJsonRPCProviderFoundError) {
        notification.error({
          message: 'Login Error ' + connectorErrorText.NoStaticJsonRPCProviderFoundError,
          description: e.message,
        })
      } else if (e instanceof CouldNotActivateError) {
        notification.error({
          message: 'Login Error ' + connectorErrorText.CouldNotActivateError,
          description: e.message,
        })
      } else {
        notification.error({ message: 'Login Error: ', description: e.message })
      }
    },
    [notification]
  )

  let networkDisplay: ReactElement | undefined
  if (selectedChainId && selectedChainId !== scaffoldAppProviders.targetNetwork.chainId) {
    const description = (
      <div>
        You have <b>{getNetwork(selectedChainId)?.name}</b> selected and you need to be on{' '}
        <b>{getNetwork(scaffoldAppProviders.targetNetwork)?.name ?? 'UNKNOWN'}</b>.
      </div>
    )
    networkDisplay = (
      // <div style={{ zIndex: 2, position: 'absolute', right: 0, top: 90, padding: 16 }}>
      //   <Alert message="⚠️ Wrong Network" description={description} type="error" closable={false} />
      // </div>
      <span className="fixed bottom-4 right-4 text-lg inline-flex items-center rounded-md bg-pink-100 px-2.5 py-0.5 font-medium text-pink-800">
        <IoMdWarning className="text-xl mr-2" />
        {description}
      </span>
    )
  } else {
    networkDisplay = (
      <div
        className="fixed bottom-4 right-4"
        style={{
          color: scaffoldAppProviders.targetNetwork.color,
        }}>
        {scaffoldAppProviders.targetNetwork.name}
      </div>
    )
  }

  return (
    <>
      <div className="relative bg-white">
        {/* @ts-ignore */}
        <Transition.Root show={sidebarOpen} as={Fragment}>
          {/* @ts-ignore */}
          <Dialog as="div" className="relative z-40 md:hidden" onClose={setSidebarOpen}>
            {/* @ts-ignore */}
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0">
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>

            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full">
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-50">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0">
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                      <button
                        type="button"
                        className="ml-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={() => setSidebarOpen(false)}>
                        <span className="sr-only">Close sidebar</span>
                        <GrFormClose className="h-12 w-12 " aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
                    <div className="flex flex-shrink-0 items-center px-4">
                      <Link href="/">
                        <a className="relative text-4xl font-semibold text-gray-800 hover:text-gray-800">
                          🥪 Supersub
                          <div className="absolute right-0 -bottom-4 text-sm font-bold text-gray-600">DEMO</div>
                        </a>
                      </Link>
                    </div>
                    <nav className="mt-5">
                      {navigation.map((item) => {
                        const isCurrent = router.pathname === item.route

                        return (
                          <Link href={item.route} key={item.name}>
                            <a
                              onClick={() => router.push(item.route)}
                              className={`${
                                isCurrent ? 'bg-gray-100' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              } group flex items-center text-gray-800 hover:text-green-400 transition-colors w-full px-2 py-4 text-sm font-medium border-0`}>
                              <item.icon
                                className={classNames(
                                  isCurrent ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                                  'ml-4 mr-3 flex-shrink-0 h-6 w-6'
                                )}
                                aria-hidden="true"
                              />
                              {item.name}
                            </a>
                          </Link>
                        )
                      })}
                    </nav>
                  </div>
                  <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
                    <Account
                      createLoginConnector={scaffoldAppProviders.createLoginConnector}
                      loginOnError={onLoginError}
                      ensProvider={scaffoldAppProviders.mainnetAdaptor?.provider}
                      blockExplorer={scaffoldAppProviders.targetNetwork.blockExplorer}
                      hasContextConnect={true}
                    />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
              <div className="w-14 flex-shrink-0" />
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col z-30 shadow-lg">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-gray-50">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4 mb-4">
                <Link href="/">
                  <a className="relative text-4xl font-semibold text-gray-800 hover:text-gray-800">
                    🥪 Supersub
                    <div className="absolute right-0 -bottom-4 text-sm font-bold text-gray-600">DEMO</div>
                  </a>
                </Link>
              </div>
              <nav className="mt-5 flex-1 bg-gray-50">
                {navigation.map((item) => {
                  const isCurrent = router.pathname === item.route
                  return (
                    <Link href={item.route} key={item.name}>
                      <a
                        onClick={() => router.push(item.route)}
                        className={`${
                          isCurrent ? 'bg-gray-100' : 'text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900'
                        } group flex items-center text-gray-800 hover:text-green-400 transition-colors w-full px-2 py-4 text-sm font-medium bg-white border-0`}>
                        <item.icon
                          className={classNames(
                            isCurrent ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                            'ml-4 mr-3 flex-shrink-0 h-6 w-6'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </a>
                    </Link>
                  )
                })}
                <div>
                  <button
                    onClick={() => setOpenDemo(true)}
                    className="bg-gray-50 cursor-pointer hover:bg-gray-100 group flex items-center text-gray-800 hover:text-green-400 transition-colors w-full px-2 py-4 text-sm font-medium border-0">
                    <BsWindow className="text-gray-400 group-hover:text-gray-500 ml-4 mr-3 flex-shrink-0 h-6 w-6" />
                    DemoModal
                  </button>
                </div>
              </nav>
            </div>
            <div className="flex flex-shrink-0 self-start border-t border-gray-200 ml-6 mb-8">
              <Account
                createLoginConnector={scaffoldAppProviders.createLoginConnector}
                loginOnError={onLoginError}
                ensProvider={scaffoldAppProviders.mainnetAdaptor?.provider}
                blockExplorer={scaffoldAppProviders.targetNetwork.blockExplorer}
                hasContextConnect={true}
              />
            </div>
          </div>
        </div>

        {/* Holder */}
        <div className="flex flex-1 flex-col md:pl-64">
          <div className="sticky top-0 z-10 bg-white pl-1 pt-1 sm:pl-3 sm:pt-3 md:hidden">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 cursor-pointer inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setSidebarOpen(true)}>
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <main className="flex-1">
            <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">{children}</div>
          </main>
        </div>
      </div>

      <div className="absolute">{notificationHolder}</div>

      <DemoModal
        onLoginError={onLoginError}
        scaffoldAppProviders={scaffoldAppProviders}
        open={openDemo}
        setOpen={setOpenDemo}
      />

      {networkDisplay}
    </>
  )
}
