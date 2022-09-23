import { Dialog, Transition } from '@headlessui/react'
import { useEthersAdaptorFromProviderOrSigners } from 'eth-hooks'
import { useEthersAppContext } from 'eth-hooks/context'
import { asEthersAdaptor } from 'eth-hooks/functions'
import { utils } from 'ethers'
import Link from 'next/link'
import React, { Dispatch, Fragment, SetStateAction, useState } from 'react'
import { AiOutlineLoading } from 'react-icons/ai'
import { useAppContracts, useConnectAppContracts, useLoadAppContracts } from '~common/components/context'
import { MAINNET_PROVIDER } from '~~/config/app.config'

interface AirdropModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export const AirdropModal: React.FC<AirdropModalProps> = ({ open, setOpen }) => {
  const [claiming, setClaiming] = useState(false)
  const [success, setSuccess] = useState(false)

  useLoadAppContracts()
  const context = useEthersAppContext()
  const [mainnetAdaptor] = useEthersAdaptorFromProviderOrSigners(MAINNET_PROVIDER)
  useConnectAppContracts(mainnetAdaptor)
  useConnectAppContracts(asEthersAdaptor(context))
  const SSA = useAppContracts('SSA', context.chainId)

  const claimToken = async () => {
    try {
      if (!SSA || !context?.account) {
        throw new Error('No SSA')
      }

      setClaiming(true)

      const tx = await SSA.airdropPass(utils.parseEther('940'), context.account)
      await tx.wait()

      setSuccess(true)
    } catch (e) {
      console.error('error', e)
    } finally {
      setClaiming(false)
    }
  }

  const Heading = () => (
    <div className="text-5xl px-2 space-y-2 text-center uppercase tracking-widest font-bold bg-white bg-opacity-50 text-gray-800">
      <div className="text-5xl uppercase tracking-widest font-bold text-gray-800">Airdrop</div>
      <div className="text-5xl whitespace-nowrap uppercase tracking-widest font-bold text-gray-800">Time 🥳</div>
    </div>
  )

  const Background = () => (
    <>
      <div className="absolute right-16 -top-12 text-6xl transform scale-[3] rotate-12 opacity-50 pointer-events-none -z-10">
        ⚡
      </div>
      <div className="absolute left-16 top-24 text-3xl transform scale-[3] -rotate-12 opacity-50 pointer-events-none -z-10">
        ⚡
      </div>
      <div className="absolute right-48 bottom-4 text-3xl transform scale-[3] rotate-12 opacity-50 pointer-events-none -z-10">
        ⚡
      </div>
    </>
  )

  return (
    // @ts-ignore
    <Transition.Root show={open} as={Fragment}>
      {/* @ts-ignore */}
      <Dialog as="div" className="relative  z-50" onClose={setOpen}>
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
                  <div className="flex flex-col items-center space-y-8 mt-5">
                    <Heading />
                    <Background />

                    <div className="flex flex-col items-center text-center space-y-12 py-8 w-full text-lg text-gray-800">
                      <div className="flex flex-col items-center space-y-10">
                        <div className="space-y-4">
                          <div>
                            One attribute of <b>Supersubs</b> is they <b>can be traded</b> on Marketplaces.
                          </div>
                          <div>
                            This means if you want your Supersub <b>start at a higher Tier</b> just{' '}
                            <b>buy it from someone</b> else!
                          </div>
                          <div>
                            Because there is currently no market for Supersubs we <b>emulate the purchase</b>
                            <b> by airdropping</b> you one.
                          </div>
                        </div>

                        {success ? (
                          <Link href="/">
                            <div className="cursor-pointer tracking-wider flex items-end space-x-1 text-2xl font-semibold bg-white">
                              <div>Success!</div>
                              <div>View your Supersub</div>
                              <div className="underline text-green-400">here</div>
                            </div>
                          </Link>
                        ) : (
                          <>
                            {context.account ? (
                              <button
                                type="button"
                                disabled={claiming}
                                className="bg-green-400 hover:bg-green-500 inline-flex items-center w-min whitespace-nowrap text-2xl justify-center rounded-md cursor-pointer border border-transparent px-8 py-2 font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                onClick={claimToken}>
                                {claiming ? (
                                  <>
                                    <AiOutlineLoading className="w-6 h-6 mr-4 animate-spin" />
                                    <div>Claiming ...</div>
                                  </>
                                ) : (
                                  <>
                                    <div>Claim Supersub</div>
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                className={`bg-gray-400 hover:bg-gray-500 inline-flex items-center w-min whitespace-nowrap text-2xl justify-center rounded-md cursor-pointer border border-transparent px-8 py-2 font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
                                onClick={claimToken}>
                                Connect Wallet to claim
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
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
