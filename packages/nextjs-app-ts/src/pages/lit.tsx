import { FC, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
// @ts-expect-error
import LitJsSdk from '@lit-protocol/sdk-browser'
import { useEthersAppContext } from 'eth-hooks/context'
import _ from 'lodash'
import { useScaffoldAppProviders } from '~common/components'
import { Header } from '~~/components/Header'
import {
  ALCHEMY_KEY,
  CONNECT_TO_BURNER_AUTOMATICALLY,
  LOCAL_PROVIDER,
  MAINNET_PROVIDER,
  TARGET_NETWORK_INFO,
} from '~~/config/app.config'
import { generateEvmContractConditions } from '~~/helpers/generateEvmContractConditions'
import { SSAJson } from '~~/helpers/constants'

const getSigningMsg = (account: string, chainId: number) =>
  `Supersub wants you to sign in with your Ethereum account:\n${account}\n\nURI: ${
    window.location.href
  }\nChain ID: ${chainId}\nNonce: ${_.random(
    176545765434512,
    999999999999999,
    false
  )}\nIssued At: ${new Date().getDate()}`

type EncryptedData = {
  encryptedString: string
  encryptedSymmetricKey: string
}

const tier1_data = {
  posts: [
    {
      text: 'This is post 1 tier 1',
    },
    {
      text: 'This is post 2 tier 1',
    },
    {
      text: 'This is post 3 tier 1',
    },
  ],
}

const tier2_data = {
  posts: [
    {
      text: 'This is post 1 tier 2',
    },
    {
      text: 'This is post 2 tier 2',
    },
    {
      text: 'This is post 3 tier 2',
    },
  ],
}

const tier3_data = {
  posts: [
    {
      text: 'This is post 1 tier 3',
    },
    {
      text: 'This is post 2 tier 3',
    },
    {
      text: 'This is post 3 tier 3',
    },
  ],
}

const substationData = [tier1_data, tier2_data, tier3_data]

const blobToB64 = (blob: Blob) =>
  new Promise((resolve, _) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })

const Page: FC = ({}) => {
  const [data, setData] = useState<EncryptedData>()
  const [client, setClient] = useState<any>(undefined)

  const chain = 'goerli'
  const evmContractConditions = generateEvmContractConditions(SSAJson.address, chain, 0)

  const context = useEthersAppContext()
  const scaffoldAppProviders = useScaffoldAppProviders({
    targetNetwork: TARGET_NETWORK_INFO,
    connectToBurnerAutomatically: CONNECT_TO_BURNER_AUTOMATICALLY,
    localProvider: LOCAL_PROVIDER,
    mainnetProvider: MAINNET_PROVIDER,
    alchemyKey: ALCHEMY_KEY,
  })

  useEffect(() => {
    const setupLit = async () => {
      const client = new LitJsSdk.LitNodeClient({ alertWhenUnauthorized: false })
      await client.connect()
      setClient(client)
    }

    if (!client) {
      void setupLit()
    }
  }, [client])

  const decrypt = async () => {
    if (!client) {
      const client = new LitJsSdk.LitNodeClient({ alertWhenUnauthorized: false })
      await client.connect()
    }

    const { encryptedString, encryptedSymmetricKey } = data!
    console.log('data', data)

    const msg = getSigningMsg(context.account!, context.chainId!)
    const sig = await context.signer?.signMessage(msg)
    const authSig = {
      sig: sig,
      derivedVia: 'web3.eth.personal.sign',
      signedMessage: msg,
      address: context.account,
    }

    try {
      const symmetricKey = await client.getEncryptionKey({
        evmContractConditions,
        toDecrypt: encryptedSymmetricKey,
        chain,
        authSig,
      })

      const encryptedStringBlob = await (await fetch(encryptedString)).blob()
      const decryptedString = await LitJsSdk.decryptString(encryptedStringBlob, symmetricKey)

      console.log('decryptedString', decryptedString)

      return { decryptedString }
    } catch (e) {
      console.error('error', e)
    }
  }

  const encrypt = async () => {
    if (!client) {
      const client = new LitJsSdk.LitNodeClient({ alertWhenUnauthorized: false })
      await client.connect()
    }

    // const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain })

    const msg = getSigningMsg(context.account!, context.chainId!)
    const sig = await context.signer?.signMessage(msg)
    const authSig = {
      sig: sig,
      derivedVia: 'web3.eth.personal.sign',
      signedMessage: msg,
      address: context.account,
    }

    console.log('evmContractConditions', evmContractConditions)

    const encryptedData = await Promise.all(
      substationData.map(async (tierData, i) => {
        const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(JSON.stringify(tierData))

        const encryptedSymmetricKey = await client.saveEncryptionKey({
          evmContractConditions,
          symmetricKey,
          authSig,
          chain,
          permanent: false,
        })

        const esB64 = (await blobToB64(encryptedString as Blob)) as string
        console.log('esB64', esB64)

        return {
          tier: i,
          encryptedSymmetricKey: LitJsSdk.uint8arrayToString(encryptedSymmetricKey, 'base16'),
          encryptedString: esB64,
        }
      })
    )

    console.log('encryptedData', encryptedData)

    const a = document.createElement('a')
    const file = new Blob([JSON.stringify(encryptedData)], { type: 'text/plain' })
    a.href = URL.createObjectURL(file)
    a.download = 'data.json'
    a.click()

    setData(encryptedData[0])
  }

  const connect = async () => {
    const resourceId = {
      baseUrl: 'http://localhost:3000',
      path: '/protected',
      orgId: '',
      role: '',
      extraData: 'utjzfhte5465u7tzrter5467r5tuzfrhter5e46r5t',
    }

    if (!client) {
      const client = new LitJsSdk.LitNodeClient({ alertWhenUnauthorized: false })
      await client.connect()
    }

    // const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain })

    const msg = getSigningMsg(context.account!, context.chainId!)
    const sig = await context.signer?.signMessage(msg)
    const authSig = {
      sig: sig,
      derivedVia: 'web3.eth.personal.sign',
      signedMessage: msg,
      address: context.account,
    }

    try {
      await client.saveSigningCondition({ evmContractConditions, chain, authSig, resourceId })

      const jwt = (await client.getSignedToken({
        evmContractConditions,
        chain,
        authSig,
        resourceId: resourceId,
      })) as string
      Cookies.set('lit-auth', jwt, { expires: 1 })
      console.log('\n\n\nset cookie')
    } catch (err: any) {
      console.log('error: ', err.message)
    }
  }

  return (
    <>
      <Header scaffoldAppProviders={scaffoldAppProviders} />

      <div className="w-screen h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col justify-center space-y-4">
          <button
            onClick={() => {
              void encrypt()
            }}>
            Encrypt
          </button>
          <button
            onClick={() => {
              void decrypt()
            }}>
            Decrypt
          </button>
          <button
            onClick={() => {
              void connect()
            }}>
            Request Access
          </button>
        </div>
      </div>
    </>
  )
}

export default Page
