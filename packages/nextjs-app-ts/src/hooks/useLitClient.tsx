import { useState, useEffect } from 'react'
// @ts-expect-error
import LitJsSdk from '@lit-protocol/sdk-browser'

export const useLitClient = () => {
  const [client, setClient] = useState<any>(undefined)
  const [init, setInit] = useState<boolean>(false)

  useEffect(() => {
    const setupLit = async () => {
      const client = new LitJsSdk.LitNodeClient({ alertWhenUnauthorized: false })
      await client.connect()
      setClient(client)
    }

    if (!client && !init) {
      void setupLit()
      setInit(true)
    }
  }, [client, init])

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return client
}
