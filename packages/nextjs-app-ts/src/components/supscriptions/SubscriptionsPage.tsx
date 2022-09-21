import Link from 'next/link'
import React, { useEffect } from 'react'
import { ImCompass2 } from 'react-icons/im'
import { useAppDispatch, useAppSelector } from '~~/redux/hooks'
import { triggerReload } from '~~/redux/slices/subs'
import { Subscription } from './Subscription'

interface SubscriptionsPageProps {}

export const SubscriptionsPage: React.FC<SubscriptionsPageProps> = ({}) => {
  const { initiated, loading, subscriptions } = useAppSelector((state) => state.subs)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(triggerReload())
  }, [dispatch])

  return (
    <div className="relative">
      <div className="mx-auto max-w-7xl px-8 space-y-2 pb-12">
        <div className="text-2xl font-semibold text-gray-900">Home of your Supersub</div>
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
          <>
            {subscriptions.length === 0 && (
              <div className="flex flex-col items-start space-y-8">
                <div className="text-2xl uppercase tracking-widest font-bold bg-white bg-opacity-50 text-gray-800">
                  {"It seems like you don't have subscribed to any Substation yet."}
                </div>
                <div className="text-2xl uppercase tracking-widest font-bold bg-white bg-opacity-50 text-gray-800">
                  {'Time to grab your first Supersub!'}
                </div>

                <Link href={`/explore`}>
                  <div
                    className={
                      'inline-flex relative items-center text-lg w-min cursor-pointer px-6 py-3 border transition-colors border-transparent font-medium rounded-full shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                    }>
                    <ImCompass2 className="w-8 h-8 mr-4 mt-0.5" /> <div>Explore</div>
                  </div>
                </Link>
              </div>
            )}
            {subscriptions.map((s, i: number) => (
              <Subscription subscriptions={s} key={`sub${i}`} />
            ))}
          </>
        ) : (
          <h1>Please connect your wallet</h1>
        )}
      </div>
    </div>
  )
}

export default SubscriptionsPage
