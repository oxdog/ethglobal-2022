import React from 'react'
import { GoTriangleUp } from 'react-icons/go'
import { RiExternalLinkLine } from 'react-icons/ri'
import { EmojiBubble } from '../EmojiBubble'
import FlowingBalance from '../FlowingBalance'
import { LabeledField } from '../LabeledField'
import { ShortAddress } from '../ShortAddress'

interface SubstationProps {
  name: string
  symbol: string
  address: string
  balance: string
  flowRate: string
  balanceTimestamp: number
}

export const Substation: React.FC<SubstationProps> = ({
  address,
  balance,
  balanceTimestamp,
  flowRate,
  name,
  symbol,
}) => {
  return (
    <div className="flex w-full max-w-4xl space-x-12">
      <div className="flex flex-col space-y-8">
        <EmojiBubble emoji="🥪" />
        <LabeledField label="Substation"> {name} </LabeledField>
        <LabeledField label="Symbol"> {symbol} </LabeledField>
        <LabeledField label="Address">
          <div className="flex items-end">
            <ShortAddress address={address} />
            <RiExternalLinkLine className="pl-4" />
          </div>
        </LabeledField>
      </div>
      <div className="flex w-full flex-col space-y-4">
        <div className="flex flex-col space-y-2">
          <LabeledField label="Balance">
            <FlowingBalance balance={balance} balanceTimestamp={balanceTimestamp} flowRate={flowRate} />
          </LabeledField>
          <div className="flex flex-row items-center space-x-1">
            <GoTriangleUp className="text-green-400" />
            <div>5435.234</div>
            <div>DAI/Month</div>
          </div>
        </div>

        <div className="relative flex w-full h-full max-h-80 rounded-xl overflow-hidden bg-gradient-to-t from-gray-100 to-green-200">
          <div className="absolute w-full h-96 -top-32 -left-40 bg-gray-100 ring-4 ring-green-400 transform -rotate-45"></div>
        </div>
        <div className="text-sm text-gray-200 select-none">Demo chart, no time for real one during hackathon</div>
      </div>
    </div>
  )
}
