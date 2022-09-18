import React from 'react'
import { useAppSelector } from '~~/redux/hooks'
import { Subscription } from './Subscription'

interface SubscriptionsPageProps {}

export const SubscriptionsPage: React.FC<SubscriptionsPageProps> = ({}) => {
  const { initiated, loading, subscriptions } = useAppSelector((state) => state.subs)

  return (
    <div className="py-8 px-8">
      <div className="flex justify-start space-x-8">
        {subscriptions.map((s, i: number) => (
          <Subscription subscriptions={s} key={`sub${i}`} />
        ))}

        {loading ? (
          <h1>Loading...</h1>
        ) : initiated ? (
          subscriptions.map((s, i: number) => <Subscription subscriptions={s} key={`sub${i}`} />)
        ) : (
          <h1>Please connect your wallet</h1>
        )}
        {}
      </div>
    </div>
  )
}

export default SubscriptionsPage
