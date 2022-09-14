import { Framework } from '@superfluid-finance/sdk-core'
import { useEthersAppContext } from 'eth-hooks/context'
import { Signer } from 'ethers'
import React, { useState } from 'react'

import FlowingBalance from '../FlowingBalance'
import ProgressBar from '../Progressbar'
import { ShortAddress } from '../ShortAddress'

import { TSubscription } from '~~/redux/slices/subs'
import { useAppDispatch } from '~~/redux/hooks'
import { EmojiBubble } from '../EmojiBubble'

interface SubscriptionProps {
  subscriptions: TSubscription
}

export const Subscription: React.FC<SubscriptionProps> = ({ subscriptions: sub }) => {
  const [txMessage, setTxMessage] = useState<string>('')
  const context = useEthersAppContext()
  const dispatch = useAppDispatch()

  const pauseFlow = async () => {
    setTxMessage('⏳🥪 Confirm...')

    const sf = await Framework.create({
      chainId: 5,
      provider: context.provider,
    })

    const DAIxContract = await sf.loadSuperToken('fDAIx')
    const DAIx = DAIxContract.address

    try {
      const deleteFlowOperation = sf.cfaV1.deleteFlow({
        sender: context.account as string,
        receiver: sub.address,
        flowRate: sub.flowRate,
        superToken: DAIx,
      })

      const result = await deleteFlowOperation.exec(context.signer as Signer)

      setTxMessage('⏳🥪 Pausing...')
      const recipe = await context.provider?.waitForTransaction(result.hash)
      if (recipe?.status === 0) {
        setTxMessage('❌🥪 Failed!')
      } else {
        setTxMessage('✅🥪 Paused!')
        setTimeout(function () {
          setTxMessage('')
        }, 4000)
      }

      setTimeout(function () {
        setTxMessage('')
      }, 4000)
    } catch (error: any) {
      console.log(
        "Hmmm, your transaction threw an error. Make sure that this stream does not already exist, and that you've entered a valid Ethereum address!"
      )
      console.error(error)

      if (error.code === 4001) {
        setTxMessage('❌🥪 Cancelled')
      } else {
        setTxMessage('An error occured')
      }

      setTimeout(function () {
        setTxMessage('')
      }, 4000)
    }
  }

  return (
    <div className="group relative flex flex-col items-center justify-center bg-gray-50 py-8 px-4 rounded-xl shadow-md overflow-hidden">
      <div className="flex flex-row w-full justify-around items-start">
        <div className="flex flex-col items-center">
          <EmojiBubble emoji="🥪" />
          <div className="pt-4 w-min text-3xl">{sub.name}</div>
          <div className="flex flex-col items-center justify-center space-y-8"></div>
        </div>

        <div className="flex flex-col items-center pt-8">
          <div className="text-2xl font-bold">Tier</div>
          <div className="text-4xl font-bold">{sub.tier}</div>
        </div>
      </div>

      <div className="w-full flex items-end justify-between">
        {!sub.active ? (
          <div className="font-bold uppercase text-gray-300"> inactive </div>
        ) : (
          <button
            onClick={() => pauseFlow()}
            disabled={txMessage !== ''}
            className="text-sm h-min border-2 border-gray-400 rounded-md text-gray-400 hover:text-gray-800 bg-white">
            {txMessage !== '' ? txMessage : 'Pause'}
          </button>
        )}

        <div className="flex flex-col items-end">
          <div className="">DAI Until next Tier</div>
          <FlowingBalance
            balance={sub.toNextTier}
            balanceTimestamp={Number(sub.balanceTimestamp)}
            flowRate={sub.flowRate}
            reverse={true}
          />
        </div>
      </div>

      <a
        href={`https://goerli.etherscan.io/address/${sub.address}`}
        target="_blank"
        className="absolute top-2 right-4 text-gray-200 hover:text-gray-400 tracking-wider cursor-pointer"
        rel="noreferrer">
        <ShortAddress address={sub.address} />
      </a>

      <div className="absolute bottom-0 w-full">
        <ProgressBar
          fromBalance={sub.tier < sub.availableTiers.length ? sub.availableTiers[sub.tier] : sub.availableTiers[-1]}
          toNextTier={sub.toNextTier}
          balance={sub.passBalance}
          balanceTimestamp={Number(sub.balanceTimestamp)}
          flowRate={sub.flowRate}
        />
      </div>
    </div>
  )
}
