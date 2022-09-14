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

const chain = 'goerli'
const functionAbi = {
  name: 'getPassdataViaAddress',
  inputs: [
    {
      name: '',
      type: 'address',
    },
  ],
  outputs: [
    {
      name: 'active',
      type: 'bool',
    },
    {
      name: 'tier',
      type: 'uint256',
    },
  ],
  stateMutability: 'view',
  type: 'function',
}

const evmContractConditions = [
  {
    contractAddress: '0xAE774234E3B77529cf10aac7aaF1C7cC508D06Dd',
    chain,
    functionName: 'getPassdataViaAddress',
    functionParams: [':userAddress'],
    functionAbi,
    returnValueTest: {
      key: 'active',
      comparator: '=',
      value: 'true',
    },
  },
  { operator: 'and' },
  {
    contractAddress: '0xAE774234E3B77529cf10aac7aaF1C7cC508D06Dd',
    chain,
    functionName: 'getPassdataViaAddress',
    functionParams: [':userAddress'],
    functionAbi,
    returnValueTest: {
      key: 'tier',
      comparator: '>=',
      value: '0',
    },
  },
]

const getSigningMsg = (account: string, chainId: number) =>
  `Supersub wants you to sign in with your Ethereum account:\n${account}\n\nURI: ${
    window.location.href
  }\nChain ID: ${chainId}\nNonce: ${_.random(
    176545765434512,
    999999999999999,
    false
  )}\nIssued At: ${new Date().getDate()}`

const Page: FC = ({}) => {
  const [client, setClient] = useState<any>(undefined)
  const [encryptedString, setEncryptedString] = useState<any>()
  const [encryptedSymmetricKey, setEncryptedSymmetricKey] = useState<any>()
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

    void setupLit()
  }, [])

  // const decrypt = async (encryptedString: string, encryptedSymmetricKey: string) => {
  const decrypt = async () => {
    if (!client) {
      const client = new LitJsSdk.LitNodeClient({ alertWhenUnauthorized: false })
      await client.connect()
    }

    const msg = getSigningMsg(context.account!, context.chainId!)
    const sig = await context.signer?.signMessage(msg)
    const authSig = {
      sig: sig,
      derivedVia: 'web3.eth.personal.sign',
      signedMessage: msg,
      address: context.account,
    }

    console.log('authSig', authSig)

    const symmetricKey = await client.getEncryptionKey({
      evmContractConditions,
      toDecrypt: encryptedSymmetricKey,
      chain,
      authSig,
    })

    const decryptedString = await LitJsSdk.decryptString(encryptedString, symmetricKey)

    console.log('decryptedString', decryptedString)

    return { decryptedString }
  }

  const encrypt = async (message: string) => {
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

    console.log('authSig', authSig)
    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(message)

    const encryptedSymmetricKey = await client.saveEncryptionKey({
      evmContractConditions,
      symmetricKey,
      authSig,
      chain,
      permanent: false,
    })

    console.log('encryptedString', encryptedString)
    console.log('encryptedSymmetricKey', encryptedSymmetricKey)

    setEncryptedString(encryptedString)
    setEncryptedSymmetricKey(LitJsSdk.uint8arrayToString(encryptedSymmetricKey, 'base16'))

    return {
      encryptedString,
      encryptedSymmetricKey: LitJsSdk.uint8arrayToString(encryptedSymmetricKey, 'base16'),
    }
  }

  const connect = async () => {
    // const id = 2 // ! TBD
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
              void encrypt('secret message')
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
