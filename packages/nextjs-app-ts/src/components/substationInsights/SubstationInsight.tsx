import { BigNumber, utils } from 'ethers'
import React from 'react'
import { GoTriangleUp } from 'react-icons/go'
import { RiExternalLinkLine } from 'react-icons/ri'
import { TSubstation } from '~~/pages/user/substations'
import { EmojiBubble } from '../EmojiBubble'
import FlowingBalance from '../FlowingBalance'
import { LabeledField } from '../LabeledField'
import { ShortAddress } from '../ShortAddress'

export const Substation: React.FC<TSubstation> = ({
  address,
  balance,
  balanceTimestamp,
  flowRate,
  name,
  symbol,
  tiers,
}) => {
  const flowRateToMonthly = (flowRate: string) => {
    const monthly = BigNumber.from(flowRate).mul(60 * 60 * 24 * 30)
    const DAI = utils.formatEther(monthly.toString())
    const digit = DAI.indexOf('.')

    return digit > 0 ? DAI.substring(0, digit + 3) : DAI
  }

  return (
    <div className="flex flex-col w-full max-w-4xl space-y-12 pb-24">
      <div>
        <div className="flex space-x-8 items-center">
          <EmojiBubble emoji="🥪" />
        </div>
        <h1>General Info</h1>
        <div className="grid grid-cols-3 text-lg gap-4">
          <LabeledField label="Substation"> {name} </LabeledField>
          <LabeledField label="Symbol"> {symbol} </LabeledField>
          <LabeledField label="Address">
            <div className="flex items-end">
              <ShortAddress address={address} />
              <RiExternalLinkLine className="pl-4" />
            </div>
          </LabeledField>
        </div>
      </div>

      <div>
        <h1>Cashflow</h1>
        <div className="flex w-full flex-col space-y-4">
          <div className="flex justify-between">
            <LabeledField label="Balance">
              <FlowingBalance balance={balance} balanceTimestamp={balanceTimestamp} flowRate={flowRate} />
            </LabeledField>
            <div className="flex flex-row items-center space-x-1 text-lg">
              <GoTriangleUp className="text-green-400" />
              <div>{flowRateToMonthly(flowRate)}</div>
              <div>DAI/Month</div>
            </div>
          </div>

          <div className="relative flex w-full h-96 max-h-80 rounded-xl overflow-hidden bg-gradient-to-t from-gray-100 to-green-200">
            <div className="absolute top-2 right-2 bg-gray-50 rounded-lg px-2">D | M | Y | ALL</div>
            <div className="absolute transform -rotate-45 w-screen h-2 bg-green-400" />
          </div>
          <div className="text-sm text-gray-200 select-none">Demo chart, no time for real one during hackathon</div>
        </div>
      </div>

      <div>
        <h1> Tiers </h1>
        <div className="grid grid-cols-3 text-lg gap-4">
          {tiers.map((tier, i) => (
            <LabeledField label={'Tier ' + i} key={tier + i}>
              <div className="flex items-end">{utils.formatEther(tier)} DAI</div>
            </LabeledField>
          ))}
        </div>
      </div>
    </div>
  )
}
