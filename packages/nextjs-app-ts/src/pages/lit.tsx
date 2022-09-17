import { FC, useState } from 'react'
import Cookies from 'js-cookie'
// @ts-expect-error
import LitJsSdk from '@lit-protocol/sdk-browser'
import { useEthersAppContext } from 'eth-hooks/context'
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
import { getSigningMsg } from '~~/helpers/getSigningMsg'
import { getJWTResourceId } from '~~/helpers/getJWTResourceId'
import { useLitClient } from '~~/hooks/useLitClient'
import { useClearCookiesOnDisconnect } from '~~/hooks/useClearCookiesOnDisconnect'
import { useLoadUserOnWalletConnect } from '~~/hooks/useLoadUserOnWalletConnect'

type EncryptedData = {
  encryptedString: string
  encryptedSymmetricKey: string
}

// Demo tierdata
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
  const client = useLitClient()

  useLoadUserOnWalletConnect()
  useClearCookiesOnDisconnect()

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

  const decrypt = async () => {
    if (!client) {
      console.log('no client')
      return
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
      console.log('no client')
      return
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
    const resourceId = getJWTResourceId(SSAJson.address)

    if (!client) {
      console.log('no client')
      return
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
      const jwt = (await client.getSignedToken({
        evmContractConditions,
        chain,
        authSig,
        resourceId,
      })) as string
      Cookies.set('lit-auth', jwt, { expires: 1 })
      console.log('\n\n\nset cookie')
    } catch (err: any) {
      console.log('error: ', err.message)
    }
  }

  const setSigningCondition = async () => {
    const resourceId = getJWTResourceId(SSAJson.address)

    if (!client) {
      console.log('no client')
      return
    }

    try {
      const msg = getSigningMsg(context.account!, context.chainId!)
      const sig = await context.signer?.signMessage(msg)
      const authSig = {
        sig: sig,
        derivedVia: 'web3.eth.personal.sign',
        signedMessage: msg,
        address: context.account,
      }

      await client.saveSigningCondition({
        evmContractConditions,
        chain,
        authSig,
        resourceId,
      })

      console.log('Set Condition')
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
          <button
            onClick={() => {
              void setSigningCondition()
            }}>
            Set JWT Signing Condition
          </button>
        </div>
      </div>
    </>
  )
}

export default Page
