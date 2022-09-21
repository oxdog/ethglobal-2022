import React from 'react'

import { TSubstation } from '~~/pages/user/substations'
import { Substation } from './SubstationInsight'

interface SubstationsInsightPageProps {
  substations: TSubstation[]
}

export const SubstationInsightPage: React.FC<SubstationsInsightPageProps> = ({ substations }) => {
  return (
    <>
      <div className="max-w-7xl px-8 space-y-2 pb-12">
        <div className="text-2xl font-semibold text-gray-900">Your Substations</div>
        <div className="text-white bg-green-400 w-min whitespace-nowrap font-bold">
          This page is usually only available to creators of the SubStation. For demo purposes it can be viewed by all.
        </div>
      </div>

      <div className="fixed right-0 top-0 text-7xl transform scale-[3] -rotate-12 opacity-50 pointer-events-none">
        🥪
      </div>

      <div className="flex flex-col pl-8 space-y-4">
        {substations.map((s, i) => (
          <Substation
            key={s.name + i}
            name={s.name}
            symbol={s.symbol}
            address={s.address}
            balance={s.balance}
            balanceTimestamp={s.balanceTimestamp}
            flowRate={s.flowRate}
            tiers={s.tiers}
          />
        ))}
      </div>
    </>
  )
}

export default SubstationInsightPage
