import { SignalIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import React from 'react'
import { ShortAddress } from '../ShortAddress'

interface ExplorePageProps {}

export const ExplorePage: React.FC<ExplorePageProps> = ({}) => {
  const oxdogAddress = '0xBCa2081845Bb4cc52FeAC84f38B4A5Ef41B1C0e'
  const breadAddress = '0xBCa2081845Bb4cc52FeAC84f38B4A5Ef41B1C0e'
  const mevAddress = '0xBCa2081845Bb4cc52FeAC84f38B4A5Ef41B1C0e'

  return (
    <>
      <div className="max-w-7xl px-8 space-y-2 pb-12">
        <div className="text-2xl font-semibold text-gray-900">Explore available Substations</div>
      </div>

      <div className="flex flex-col items-center px-8">
        <div className="flex flex-wrap gap-8">
          {/* OXDOG STATION */}
          <div className="relative aspect-square h-72 p-8 shadow bg-gray-50 rounded-lg overflow-hidden">
            <div className="absolute right-0 top-0 text-7xl transform scale-[3] -rotate-12 opacity-50 pointer-events-none">
              🥪
            </div>
            <div className="relative flex flex-col h-full justify-between z-20">
              <div>
                <div className="text-5xl bg-gray-50 bg-opacity-50 w-min uppercase tracking-widest font-bold text-gray-800">
                  oxdog
                </div>
                <div className="text-5xl bg-gray-50 bg-opacity-50 uppercase tracking-widest font-bold text-gray-800">
                  Station
                </div>
                <div className="mr-2 font-semibold text-gray-400">
                  <a
                    href={`https://goerli.etherscan.io/address/${oxdogAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="no-underline text-gray-400 hover:text-gray-400 tracking-wider cursor-pointer">
                    <ShortAddress address={oxdogAddress} />
                  </a>
                </div>
              </div>

              <Link href={`/subscribe?sub=${oxdogAddress}&reactivate=true`}>
                <a
                  className={
                    'inline-flex relative items-center text-lg w-min cursor-pointer px-6 py-3 border transition-colors border-transparent font-medium rounded-full shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                  }>
                  <SignalIcon className="w-8 h-8 mr-2 mt-0.5" /> <div>Subscribe</div>
                </a>
              </Link>
            </div>
          </div>

          {/* BREAD STATION */}
          <div className="relative aspect-square h-72 p-8 shadow bg-gray-50 rounded-lg overflow-hidden">
            <div className="absolute -right-8 bottom-8 text-7xl transform scale-[3] -rotate-12 opacity-50 pointer-events-none">
              🥖
            </div>
            <div className="relative flex flex-col h-full justify-between z-20">
              <div>
                <div className="text-5xl uppercase tracking-widest font-bold text-gray-800">bread</div>
                <div className="text-5xl uppercase tracking-widest font-bold text-gray-800">Station</div>
                <div className="mr-2 font-semibold text-gray-400">
                  <a
                    href={`https://goerli.etherscan.io/address/${breadAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="no-underline text-gray-400 hover:text-gray-400 tracking-wider cursor-pointer">
                    <ShortAddress address={breadAddress} />
                  </a>
                </div>
              </div>

              <Link href={`/subscribe?sub=${breadAddress}&reactivate=true`}>
                <a
                  className={
                    'inline-flex relative items-center text-lg w-min cursor-pointer px-6 py-3 border transition-colors border-transparent font-medium rounded-full shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                  }>
                  <SignalIcon className="w-8 h-8 mr-2 mt-0.5" /> <div>Subscribe</div>
                </a>
              </Link>
            </div>
          </div>

          {/* MEV STATION */}
          <div className="relative aspect-square h-72 p-8 shadow bg-gray-50 rounded-lg overflow-hidden">
            <div className="absolute right-0 top-0 text-7xl transform scale-[3] rotate-12 opacity-50 pointer-events-none">
              ⚡
            </div>
            <div className="relative flex flex-col h-full justify-between z-20">
              <div>
                <div className="text-5xl bg-gray-50 w-min bg-opacity-50 uppercase tracking-widest font-bold text-gray-800">
                  MEV
                </div>
                <div className="text-5xl bg-gray-50 bg-opacity-50 uppercase tracking-widest font-bold text-gray-800">
                  Station
                </div>
                <div className="mr-2 font-semibold text-gray-400">
                  <a
                    href={`https://goerli.etherscan.io/address/${mevAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="no-underline text-gray-400 hover:text-gray-400 tracking-wider cursor-pointer">
                    <ShortAddress address={mevAddress} />
                  </a>
                </div>
              </div>

              <Link href={`/subscribe?sub=${mevAddress}&reactivate=true`}>
                <a
                  className={
                    'inline-flex relative items-center text-lg w-min cursor-pointer px-6 py-3 border transition-colors border-transparent font-medium rounded-full shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                  }>
                  <SignalIcon className="w-8 h-8 mr-2 mt-0.5" /> <div>Subscribe</div>
                </a>
              </Link>
            </div>
          </div>

          {/* Your own */}
          <div className="relative p-8 shadow bg-gray-50 rounded-lg overflow-hidden">
            <div className="absolute right-4 bottom-0 text-7xl transform scale-[3] rotate-12 opacity-50 pointer-events-none">
              🐣
            </div>
            <div className="relative h-full flex flex-col justify-between z-20">
              <div className="text-xl pb-2 uppercase tracking-widest font-bold text-gray-800">Are you a</div>

              <div>
                <div className="text-4xl uppercase tracking-widest font-bold text-gray-800">Creator</div>
                <div className="text-4xl uppercase tracking-widest font-bold text-gray-800">Artist</div>
                <div className="text-4xl uppercase tracking-widest font-bold text-gray-800">Dao</div>
              </div>

              <div className="flex items-end space-x-1 text-xl py-4 uppercase tracking-widest font-bold text-gray-800">
                <div>Start your own</div>
                <div className="bg-white shadow">Substation</div>
              </div>

              <div className="text-xl py-2 px-4 cursor-pointer ring-2 ring-gray-400 bg-gray-50 rounded-full w-min whitespace-nowrap uppercase tracking-widest font-bold text-gray-600">
                not available yet
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
