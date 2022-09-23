import { SignalIcon } from '@heroicons/react/24/outline'
import { Framework } from '@superfluid-finance/sdk-core'
import { useEthersAppContext } from 'eth-hooks/context'
import { Signer } from 'ethers'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useState } from 'react'
import { AiOutlineLoading } from 'react-icons/ai'
import { IoMdCheckmark } from 'react-icons/io'
import { EMOJIS, FLOW_RATES } from '~~/helpers/constants'
import { SubInfo } from '~~/pages/subscribe'
import { useAppSelector } from '~~/redux/hooks'

import { ShortAddress } from '../ShortAddress'

interface SubscribePageProps {
  subInfo: SubInfo
}

export const SubscribePage: FC<SubscribePageProps> = ({ subInfo }) => {
  const [txMessage, setTxMessage] = useState<string>('')
  const [subscribing, setSubscribing] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [selectedRate, setSelectedRate] = useState(0)

  const loading = useAppSelector((state) => state.subs.loading)
  const subMatch = useAppSelector((state) =>
    state.subs.subscriptions.filter((s) => s.address === subInfo.address && s.active)
  )

  const router = useRouter()
  const context = useEthersAppContext()

  const createFlow = async (receiver: string, flowRate: string) => {
    setTxMessage('Waiting for confirmation...')
    setSubscribing(true)

    try {
      const sf = await Framework.create({
        chainId: 80001,
        provider: context.provider,
      })

      const DAIxContract = await sf.loadSuperToken('fDAIx')
      const DAIx = DAIxContract.address

      const createFlowOperation = sf.cfaV1.createFlow({
        flowRate: flowRate,
        receiver,
        superToken: DAIx,
        // userData?: string
      })

      const result = await createFlowOperation.exec(context.signer as Signer)

      if (Object.keys(router.query).includes('reactivate')) {
        setTxMessage('Re-activating Supersub...')
      } else {
        setTxMessage('Creating Supersub...')
      }

      const recipe = await context.provider?.waitForTransaction(result.hash)
      if (recipe?.status === 0) {
        setTxMessage('Transaction failed!')
      } else {
        if (Object.keys(router.query).includes('reactivate')) {
          setTxMessage('Supersub re-activated!')
        } else {
          setTxMessage('Supersub created!')
        }

        setSuccess(true)
      }
    } catch (error: any) {
      console.log(
        "Hmmm, your transaction threw an error. Make sure that this stream does not already exist, and that you've entered a valid Ethereum address!"
      )
      console.error(error)

      if (error.code === 4001) {
        setTxMessage('Cancelled Supersub!')
      } else {
        setTxMessage('An error occured')
      }

      setTimeout(function () {
        setTxMessage('')
      }, 4000)
    } finally {
      setSubscribing(false)
    }
  }

  const renderInvalidAddress = () => (
    <div className="relative flex flex-col z-10">
      <div className="absolute -left-24 text-7xl transform scale-[3] opacity-50 pointer-events-none -z-10">😢</div>
      <div className="text-5xl bg-white uppercase tracking-widest outline-4 outline-white font-bold text-gray-800">
        Invalid Address
      </div>
    </div>
  )

  const renderSubscribe = () => (
    <div className="relative flex flex-col z-10">
      <div className="absolute -left-24 text-7xl transform scale-[3] -rotate-12 opacity-50 pointer-events-none -z-10">
        {EMOJIS[subInfo.address]}
      </div>
      <div className="text-5xl uppercase tracking-widest font-bold bg-white bg-opacity-50 text-gray-800">Subscribe</div>
      <div className="flex items-start space-x-4">
        <div className="text-2xl mt-2 uppercase tracking-widest font-bold text-gray-800 bg-white bg-opacity-50">to</div>
        <div className="text-7xl uppercase tracking-widest font-bold text-gray-800 w-min">{subInfo?.name}</div>
      </div>
      <div className="self-end mr-2 font-semibold text-gray-400">
        <a
          href={`https://mumbai.polygonscan.com/address/${subInfo?.address}`}
          target="_blank"
          rel="noreferrer"
          className="no-underline text-gray-400 hover:text-gray-400 tracking-wider cursor-pointer">
          <ShortAddress address={subInfo?.address} />
        </a>
      </div>

      {Object.keys(router.query).includes('reactivate') && (
        <div className="self-end mt-2 mr-2 font-semibold text-gray-400">Subscribe to re-activate your Supersub</div>
      )}

      {!!context.provider ? (
        <div className="flex flex-col items-end self-end space-y-8 mt-12">
          {/* <div className="flex flex-col items-end font-semibold  text-gray-400 space-y-2">
      <div>The Rate changes how fast you unlock tiers</div>
      <div className="self-end w-72 h-12 rounded-lg ring border-green-400"></div>
    </div> */}

          {subMatch.length === 0 && !success && (
            <div className="flex overflow-hidden items-center rounded-2xl shadow-sm ring-2 ring-green-500">
              {FLOW_RATES[subInfo.address].map((flowRate, i) => (
                <>
                  <button
                    key={flowRate.value}
                    onClick={() => setSelectedRate(i)}
                    className={`${
                      selectedRate === i
                        ? 'bg-green-500 text-gray-50'
                        : 'text-opacity-50 text-gray-500 bg-white hover:bg-gray-50'
                    } flex flex-col items-center cursor-pointer px-2 border transition-colors  border-transparent shadow-sm`}>
                    <div className="text-xl font-bold">{flowRate.rate}</div>
                    <div className="text-base font-medium">DAI/Month</div>
                  </button>

                  {/* {i < FLOW_RATES[subInfo.address].length - 1 && (
                  <div className="h-10 w-0.5 bg-green-400 bg-opacity-50" />
                )} */}
                </>
              ))}
            </div>
          )}

          <button
            onClick={() => createFlow(subInfo.address, FLOW_RATES[subInfo.address][selectedRate].value)}
            disabled={subscribing || subMatch.length > 0}
            type="button"
            className={
              'inline-flex relative items-center text-lg w-min cursor-pointer px-6 py-3 border transition-colors border-transparent font-medium rounded-full shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
            }>
            {subscribing || loading ? (
              <>
                <AiOutlineLoading className="w-6 h-6 mr-4 animate-spin" />
                <div> {loading ? 'Loading...' : 'Subscribing...'}</div>
              </>
            ) : (
              <>
                {subMatch.length > 0 || success ? (
                  <>
                    <IoMdCheckmark className="w-8 h-8 mr-2 mt-0.5" /> <div>Subscribed</div>
                  </>
                ) : (
                  <>
                    <SignalIcon className="w-8 h-8 mr-2 mt-0.5" /> <div>Subscribe</div>
                  </>
                )}
              </>
            )}
            <div className="absolute -bottom-8 whitespace-nowrap right-0 text-base text-gray-300">{txMessage}</div>
          </button>

          {(success || subMatch.length > 0) && (
            <Link href="/">
              <div className="self-end mt-2 mr-2 cursor-pointer flex items-end space-x-1 text-lg font-semibold text-gray-400">
                {success && <div>Success!</div>}
                <div>View your Supersub</div>
                <div className="underline text-green-400">here</div>
              </div>
            </Link>
          )}
        </div>
      ) : (
        <div className="self-end mt-12 text-right text-2xl uppercase tracking-wide  font-bold text-gray-600">
          Please connect your wallet
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col items-center pt-48">
      {subInfo.address === '' ? renderInvalidAddress() : renderSubscribe()}
    </div>
  )
}
