import { useEthersAppContext } from 'eth-hooks/context'
import Cookies from 'js-cookie'
import { useEffect } from 'react'
import { useAppSelector } from '~~/redux/hooks'

export const useClearCookiesOnDisconnect = () => {
  const context = useEthersAppContext()
  const { initiated } = useAppSelector((state) => state.subs)

  useEffect(() => {
    if (Cookies.get('lit-auth') && !initiated) {
      Cookies.remove('lit-auth')
    }
  }, [context, initiated])
}
