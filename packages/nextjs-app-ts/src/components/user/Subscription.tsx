import React from 'react'

import FlowingBalance from '../FlowingBalance'
import ProgressBar from '../Progressbar'
import { ShortAddress } from '../ShortAddress'

import { TSubscription } from '~~/redux/slices/subs'

interface SubscriptionProps {
  subscriptions: TSubscription
}

export const Subscription: React.FC<SubscriptionProps> = ({ subscriptions: sub }) => {
  return (
    <div className="relative flex flex-col items-center justify-center bg-gray-50 py-8 px-4 rounded-xl shadow-md overflow-hidden">
      <div className="flex flex-row w-full justify-around items-start">
        <div className="flex flex-col items-center">
          <div className="text-5xl bg-gray-200 rounded-full h-24 w-24 flex items-center justify-center pb-1 shadow-md shadow-cyan-400">
            🥪
          </div>
          <div className="pt-4 w-min text-3xl">{sub.name}</div>
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="text-gray-400 tracking-wider">
              <ShortAddress address={sub.address} />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center pt-8">
          <div className="text-2xl font-bold">Tier</div>
          <div className="text-4xl font-bold">{sub.tier}</div>
        </div>
      </div>

      <div className="w-full flex justify-end">
        <div>
          <div>DAI Until next Tier</div>
          <FlowingBalance
            balance={sub.toNextTier}
            balanceTimestamp={Number(sub.balanceTimestamp)}
            flowRate={sub.flowRate}
            reverse={true}
          />
        </div>
      </div>

      {!sub.active && <div className="absolute bottom-6 left-2 font-bold uppercase text-gray-300"> inactive </div>}

      <div className="absolute bottom-0 w-full">
        <ProgressBar
          fromBalance={sub.tier < sub.availableTiers.length ? sub.availableTiers[sub.tier] : sub.availableTiers[-1]}
          toNextTier={sub.toNextTier}
          balance={sub.passBalance}
          balanceTimestamp={Number(sub.balanceTimestamp)}
          flowRate={sub.flowRate}
        />
      </div>

      {/* <div className="absolute bottom-0 left-0 bg-cyan-400 w-2/3 h-4 z-10" />
      <div className="absolute bottom-0 bg-gray-200 w-full h-4" /> */}
    </div>
  )
}
