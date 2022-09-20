import { useEthersAppContext } from 'eth-hooks/context'
import _ from 'lodash'
import { useEffect, useState } from 'react'

import { useAppDispatch, useAppSelector } from '~~/redux/hooks'
import { initSubscriptions, resetSubs } from '~~/redux/slices/subs'

export const useLoadUserOnWalletConnect = () => {
  const context = useEthersAppContext()
  const { initiated } = useAppSelector((state) => state.subs)
  const dispatch = useAppDispatch()

  const [coolDown, setCooldown] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const setup = async () => {
      if (!loading && !initiated && context.signer) {
        setLoading(true)
        await dispatch(initSubscriptions(context.account as string))
        setLoading(false)
      }

      if (!loading && initiated && !context.signer) {
        setLoading(true)
        dispatch(resetSubs())
        setLoading(false)
      }
    }

    if (!coolDown) {
      setCooldown(true)
      void setup()
      _.delay(() => setCooldown(false), 2000)
    }
  }, [loading, context, dispatch, initiated, coolDown])
}
