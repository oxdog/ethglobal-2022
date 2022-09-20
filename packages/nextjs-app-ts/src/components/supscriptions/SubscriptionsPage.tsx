import React from 'react'
import { useAppSelector } from '~~/redux/hooks'
import { Subscription } from './Subscription'

interface SubscriptionsPageProps {}

export const SubscriptionsPage: React.FC<SubscriptionsPageProps> = ({}) => {
  const { initiated, loading, subscriptions } = useAppSelector((state) => state.subs)

  return (
    <div className="relative">
      <div className="mx-auto max-w-7xl px-8 space-y-2 pb-12">
        <div className="text-2xl font-semibold text-gray-900">Home of your Substations</div>
        <div className="font-semibold text-gray-400">Here you can manage your Supersubs and visit their Substation</div>
      </div>

      {initiated && (
        <>
          <div className="absolute inset-y-0 w-8 bg-gradient-to-r from-white to-transparent left-0 z-10" />
          <div className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent to-white right-0 z-10" />
        </>
      )}

      <div className="flex justify-start px-8 space-x-8 overflow-x-auto no-scrollbar">
        {loading ? (
          <h1>Loading...</h1>
        ) : initiated ? (
          subscriptions.map((s, i: number) => <Subscription subscriptions={s} key={`sub${i}`} />)
        ) : (
          <h1>Please connect your wallet</h1>
        )}
      </div>
    </div>
  )
}

export default SubscriptionsPage
