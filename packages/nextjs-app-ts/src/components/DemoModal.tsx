/* This example requires Tailwind CSS v2.0+ */
import { Dialog, Transition } from '@headlessui/react'
import { useEthersAppContext } from 'eth-hooks/context'
import Cookies from 'js-cookie'
import React, { Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react'
import { IoIosCheckmark } from 'react-icons/io'
import { IScaffoldAppProviders } from '~common/models'
import { SUPERTOKEN_ADDRESS } from '~~/helpers/constants'
import { Account } from './Account'

interface DemoModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  scaffoldAppProviders: IScaffoldAppProviders
  onLoginError: (e: Error) => void
}

export const DemoModal: React.FC<DemoModalProps> = ({ open, setOpen, scaffoldAppProviders, onLoginError }) => {
  const [step, setStep] = useState(1)
  const context = useEthersAppContext()

  useEffect(() => {
    if (step >= 6) {
      setStep(0)
    }
  }, [step])

  useEffect(() => {
    if (open) {
      setStep(0)
    }
  }, [open])

  const finish = () => {
    Cookies.set('demoModal', 'true')
    setOpen(false)
  }

  const Welcome = () => (
    <div className="text-5xl px-2 space-y-2 text-center uppercase tracking-widest font-bold bg-white bg-opacity-50 text-gray-800">
      <div className="text-5xl uppercase tracking-widest font-bold text-gray-800">Welcome</div>
      <div className="text-3xl uppercase tracking-widest font-bold text-gray-800">to</div>
      <div className="text-5xl whitespace-nowrap uppercase tracking-widest font-bold text-gray-800">Supersub Demo</div>
    </div>
  )

  const PrevNextButtons = () => (
    <div className="flex items-center w-full space-x-4">
      <button
        type="button"
        className="inline-flex w-full justify-center rounded-md cursor-pointer border border-transparent bg-gray-200 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        onClick={() => setStep(step - 1)}>
        Prev Step
      </button>
      <button
        type="button"
        className="inline-flex w-full justify-center rounded-md cursor-pointer border border-transparent bg-green-400 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        onClick={() => setStep(step + 1)}>
        Next Step
      </button>
    </div>
  )

  const drawStepWelcome = () => (
    <div className="text-lg text-center space-y-16 pt-8">
      <div className="space-y-4">
        <div>GM GM and Thank your checking out Supersub Demo.</div>
        <div>To have a smooth experience please complete the next step to have funds to play around with.</div>
      </div>
      <button
        type="button"
        className="inline-flex w-full justify-center rounded-md cursor-pointer border border-transparent bg-green-400 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        onClick={() => setStep(step + 1)}>
        Next Step
      </button>
    </div>
  )

  const drawStepConnect = () => (
    <div className="text-lg text-center space-y-16 pt-8">
      <div className="flex flex-col items-center space-y-2">
        <div>First, please connect your wallet</div>
        <Account
          createLoginConnector={scaffoldAppProviders.createLoginConnector}
          loginOnError={onLoginError}
          ensProvider={scaffoldAppProviders.mainnetAdaptor?.provider}
          blockExplorer={scaffoldAppProviders.targetNetwork.blockExplorer}
          hasContextConnect={true}
        />
      </div>

      {!!context?.account ? (
        <PrevNextButtons />
      ) : (
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md cursor-pointer border border-transparent bg-gray-200 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          onClick={() => setStep(step - 1)}>
          Prev Step
        </button>
      )}
    </div>
  )

  const drawStepAddNetwork = () => (
    <div className="flex flex-col items-center text-center space-y-12 pt-8 w-full bg-white bg-opacity-50 text-lg text-gray-800">
      <div className="space-y-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <div>
              First you need to be connected to Polygon Testnet Mumbai. This is where the contracts of the demo are
              deployed.
            </div>
            <div>Here is the network information:</div>
          </div>

          {/* <button
            type="button"
            className="inline-flex w-min whitespace-nowrap text-2xl justify-center rounded-md cursor-pointer border border-transparent bg-green-400 px-8 py-2 font-medium text-white shadow-sm hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            onClick={() => setStep(step - 1)}>
            Add Network
          </button> */}

          <div className="text-center bg-gray-100 py-2 text-gray-500">
            <div>
              Network Name <b>Mumbai Network</b>
            </div>
            <div>
              URL <b>https://matic-mumbai.chainstacklabs.com</b>
            </div>
            <div>
              Chain ID <b>80001</b>
            </div>
            <div>
              Currency Symbol <b>MATIC</b>
            </div>
            <div>
              Block Explorer URL <b>https://mumbai.polygonscan.com</b>
            </div>
          </div>

          {/* <div>
            You can also go to{' '}
            <a target="_blank" className="text-green-400" href="https://chainlist.org/" rel="noreferrer">
              Chainlist
            </a>{' '}
            , search for Mumbai and add it there. Make sure to toggle testnets besides the searchbar on
          </div> */}
        </div>
      </div>

      <PrevNextButtons />
    </div>
  )

  const drawStepTestETH = () => (
    <div className="text-lg text-center space-y-16 pt-8">
      <div className="space-y-2">
        <div>To complete transaction please make sure to have Test ETH in your wallet</div>
        <div>
          You can get some at{' '}
          <a target="_blank" className="text-green-400" href="https://faucet.polygon.technology/" rel="noreferrer">
            Polygon Faucet
          </a>{' '}
          or{' '}
          <a target="_blank" className="text-green-400" href="https://mumbaifaucet.com/" rel="noreferrer">
            Alchemy Faucet
          </a>
        </div>
      </div>

      <PrevNextButtons />
    </div>
  )

  const drawStepTokenFaucet = () => (
    <div className="flex flex-col items-center text-center space-y-12 pt-8 w-full bg-white bg-opacity-50 text-lg text-gray-800">
      <div className="space-y-8">
        <div className="space-y-4">
          <div>To create Supersubs you will need some token. You can claim them here.</div>

          <button
            type="button"
            className="inline-flex w-min whitespace-nowrap text-2xl justify-center rounded-md cursor-pointer border border-transparent bg-green-400 px-8 py-2 font-medium text-white shadow-sm hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            onClick={() => setStep(step - 1)}>
            Claim Token
          </button>
        </div>

        <div className="text-gray-300">
          <div>Here is the address to add the token to your wallet if you want:</div>
          <a
            href={`https://goerli.etherscan.io/address/${SUPERTOKEN_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className="no-underline text-gray-300 hover:text-gray-400 tracking-wider cursor-pointer">
            {SUPERTOKEN_ADDRESS}
          </a>
        </div>
      </div>

      <PrevNextButtons />
    </div>
  )

  const drawStepFinished = () => (
    <div className="flex flex-col items-center text-center space-y-12 pt-8 w-full bg-white bg-opacity-50 text-lg text-gray-800">
      <div className="space-y-8">
        <div className="space-y-8">
          <div className="text-xl">If you finished the steps you are ready to go.</div>

          <div className="flex w-full items-center justify-center space-x-2">
            <div className="flex items-center">
              <IoIosCheckmark className="text-green-400 text-3xl" />
              <div>Added Mumbai Testnet</div>
            </div>
            <div className="flex items-center">
              <IoIosCheckmark className="text-green-400 text-3xl" />
              <div>Got Test-ETH</div>
            </div>
            <div className="flex items-center">
              <IoIosCheckmark className="text-green-400 text-3xl" />
              <div>Claimed Tokens</div>
            </div>
          </div>

          <div className="text-2xl">Have fun trying out Supersub Demo!🥪</div>
          <div className="text-gray-300">You can re-open this modal via the menu</div>
        </div>
      </div>

      <div className="flex items-center w-full space-x-4">
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md cursor-pointer border border-transparent bg-gray-200 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          onClick={() => setStep(step - 1)}>
          Prev Step
        </button>
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md cursor-pointer border border-transparent bg-green-400 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          onClick={finish}>
          Start Demo
        </button>
      </div>
    </div>
  )

  const CurrentStep = () => {
    switch (step) {
      case 0:
        return drawStepWelcome()
      case 1:
        return drawStepConnect()
      case 2:
        return drawStepAddNetwork()
      case 3:
        return drawStepTestETH()
      case 4:
        return drawStepTokenFaucet()
      case 5:
        return drawStepFinished()

      default:
        return drawStepWelcome()
    }
  }

  return (
    // @ts-ignore
    <Transition.Root show={open} as={Fragment}>
      {/* @ts-ignore */}
      <Dialog
        as="div"
        className="relative  z-50"
        onClose={() => {
          if (Cookies.get('demoModal')) {
            setOpen(false)
          }
        }}>
        {/* @ts-ignore */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div>
                  <div className="absolute -left-12 text-7xl transform scale-[3] -rotate-12 opacity-50 pointer-events-none -z-10">
                    🥪
                  </div>
                  <div className="absolute right-12 -top-16 text-7xl transform scale-[3] rotate-12 opacity-50 pointer-events-none -z-10">
                    ⚡
                  </div>

                  <div className="flex flex-col items-center space-y-8 mt-5">
                    <Welcome />
                    <CurrentStep />
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
