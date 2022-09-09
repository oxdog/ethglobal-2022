import React from 'react'

import FlowingBalance from '../FlowingBalance'

interface SubscriptionProps {}

export const Subscription: React.FC<SubscriptionProps> = ({}) => {
  return (
    <div className="relative flex flex-col items-center justify-center bg-gray-50 py-8 px-4 rounded-xl shadow-md overflow-hidden">
      <div className="flex flex-row w-full justify-around items-start">
        <div className="flex flex-col items-center">
          <div className="text-5xl bg-gray-200 rounded-full h-24 w-24 flex items-center justify-center pb-1 shadow-md shadow-cyan-400">
            🥪
          </div>
          <div className="pt-4 w-min text-3xl">Supersub</div>
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="text-gray-400">0x0000...0000</div>
          </div>
        </div>

        <div className="flex flex-col items-center pt-8">
          <div className="text-2xl font-bold">Tier</div>
          <div className="text-4xl font-bold">4</div>
        </div>
      </div>

      <div className="w-full mt-4 flex justify-between">
        <div>
          <div>Until next Tier</div>
          <div>DAI </div>
          <FlowingBalance balance="1000000000000000000000" balanceTimestamp={1662754260} flowRate="48737333285854" />
        </div>
        <div>
          <div>Est. reach</div>
          <div>2nd Sep 2022</div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 bg-cyan-400 w-2/3 h-4 z-10" />
      <div className="absolute bottom-0 bg-gray-200 w-full h-4" />
    </div>
  )
}
