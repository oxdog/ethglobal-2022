import { BigNumber, utils } from 'ethers'
import React from 'react'
import { GoTriangleUp } from 'react-icons/go'
import { RiExternalLinkLine } from 'react-icons/ri'
import { TSubstation } from '~~/pages/user/substations'
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
    <div className="flex flex-col w-full max-w-4xl space-y-16 pb-24">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center space-x-2">
          <div className="text-3xl w-min uppercase whitespace-nowrap tracking-widest font-bold text-gray-800 z-40">
            General Info
          </div>
          <div className="h-px w-full bg-gray-800" />
        </div>

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

      <div className="flex flex-col space-y-8">
        <div className="flex items-center space-x-2">
          <div className="text-3xl w-min uppercase tracking-widest font-bold text-gray-800 z-40">cashflow</div>
          <div className="h-px w-full bg-gray-800" />
        </div>

        <div className="flex w-full flex-col space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <LabeledField label="Balance">
                <FlowingBalance balance={balance} balanceTimestamp={balanceTimestamp} flowRate={flowRate} />
              </LabeledField>
              <div className="flex flex-row items-center space-x-1 text-lg">
                <GoTriangleUp className="text-green-400" />
                <div>{flowRateToMonthly(flowRate)}</div>
                <div>DAI/Month</div>
              </div>
            </div>

            <div
              className={
                'inline-flex h-min whitespace-nowrap relative items-center text-lg w-min cursor-not-allowed px-6 py-3 border transition-colors border-transparent font-medium rounded-full shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              }>
              💰 Withdraw
            </div>
          </div>

          <div className="relative flex w-full h-96 max-h-80 rounded-xl overflow-hidden bg-gradient-to-t from-gray-50 to-gray-300">
            <div className="absolute top-2 right-2 bg-gray-50 rounded-lg px-2">D | M | Y | ALL</div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div>Hackathon, no time for a real chart 🤷‍♂️</div>
              <div>(the balance is accurate though)</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-8">
        <div className="flex items-center space-x-2">
          <div className="text-3xl w-min uppercase tracking-widest font-bold text-gray-800 z-40">Tiers</div>
          <div className="h-px w-full bg-gray-800" />
        </div>

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
