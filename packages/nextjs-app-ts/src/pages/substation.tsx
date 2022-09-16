import { FC, useEffect, useState } from 'react'
// @ts-expect-error
import LitJsSdk from '@lit-protocol/sdk-browser'
import { useEthersAppContext } from 'eth-hooks/context'
import { ethers } from 'ethers'
import _ from 'lodash'
import { GetServerSideProps } from 'next'
import { useScaffoldAppProviders } from '~common/components'
import { Subscription_SuperApp } from '~common/generated/contract-types'
import { Header } from '~~/components/Header'
import {
  ALCHEMY_KEY,
  CONNECT_TO_BURNER_AUTOMATICALLY,
  LOCAL_PROVIDER,
  MAINNET_PROVIDER,
  TARGET_NETWORK_INFO,
} from '~~/config/app.config'
import { SSAJson } from '~~/helpers/constants'
import { generateEvmContractConditions } from '~~/helpers/generateEvmContractConditions'

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const sub = query.sub as string
  let tierData = []

  try {
    if (sub && ethers.utils.isAddress(sub)) {
      const provider = new ethers.providers.AlchemyProvider('goerli', process.env.NEXT_PUBLIC_KEY_ALCHEMY)
      const SSA = new ethers.Contract(sub, SSAJson.abi, provider) as Subscription_SuperApp
      const generalInfo = await SSA.generalInfo()

      const cid = generalInfo.subW3name

      if (cid) {
        const url = `https://${cid}.ipfs.w3s.link/data.json`
        const res = await fetch(url)
        tierData = await res.json()
      }
    }
  } catch (e) {
    console.error('error', e)
  }

  return {
    props: {
      tierData,
    },
  }
}

const getSigningMsg = (account: string, chainId: number) =>
  `Supersub wants you to sign in with your Ethereum account:\n${account}\n\nURI: ${
    window.location.href
  }\nChain ID: ${chainId}\nNonce: ${_.random(
    176545765434512,
    999999999999999,
    false
  )}\nIssued At: ${new Date().getDate()}`

type EncryptedData = {
  tier: number
  encryptedString: string
  encryptedSymmetricKey: string
}

interface SubstationPageProps {
  tierData: EncryptedData[]
}

type Post = { text: string }

const Page: FC<SubstationPageProps> = ({ tierData }) => {
  const [client, setClient] = useState<any>(undefined)

  const chain = 'goerli'
  const evmContractConditions = generateEvmContractConditions(SSAJson.address, chain, 0)

  const [selectedTier, setSelectedTier] = useState<number>(0)
  const [decryptedPosts, setDecryptedPosts] = useState<Record<string, Array<Post>>>({})

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

  const decrypt = async (tierId: number) => {
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

    const enData = tierData[tierId]

    try {
      const { encryptedString, encryptedSymmetricKey } = enData

      console.log('evmContractConditions', evmContractConditions)

      const symmetricKey = await client.getEncryptionKey({
        evmContractConditions,
        toDecrypt: encryptedSymmetricKey,
        chain,
        authSig,
      })

      const encryptedStringBlob = await (await fetch(encryptedString)).blob()
      const decryptedData = JSON.parse((await LitJsSdk.decryptString(encryptedStringBlob, symmetricKey)) as string) as {
        posts: Array<Post>
      }

      console.log('decryptedString', decryptedData)
      console.log('tierData', enData)
      setDecryptedPosts({
        ...decryptedPosts,
        [`tier${enData.tier}`]: decryptedData.posts,
      })
    } catch (e) {
      console.error('error', e)
    }
  }

  const renderTierData = () =>
    tierData.map((data) => {
      const tierId = `tier${data.tier}`
      const posts = decryptedPosts[tierId]
      const isSelected = selectedTier === data.tier

      // console.log('posts', posts)
      return (
        <div key={tierId} className="flex flex-col" hidden={!isSelected}>
          {posts ? (
            <div className="flex flex-col space-y-8">
              {posts.map((post, i) => (
                <div key={`${tierId}post${i}`} className="flex flex-col space-y-2">
                  <div className="text-lg font-semibold">Post {i}</div>
                  <div className="">{post.text}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex space-x-4" hidden={!isSelected}>
              <div>{`${tierId} not decrypted`}</div>
              <button
                onClick={() => {
                  void decrypt(data.tier)
                }}>
                Decrypt
              </button>
            </div>
          )}
        </div>
      )
    })

  return (
    <>
      <Header scaffoldAppProviders={scaffoldAppProviders} />

      <div className="w-screen h-screen bg-white flex flex-col items-center justify-start pt-48">
        <h1>Substation</h1>
        <div className="flex items-center">
          {tierData.map((data) => (
            <button
              key={`tier${data.tier}button`}
              className={selectedTier === data.tier ? 'bg-cyan-600' : 'text-gray-600'}
              onClick={() => setSelectedTier(data.tier)}>
              Tier{data.tier}
            </button>
          ))}
        </div>

        {tierData.length === 0 ? <div>Substation not found</div> : renderTierData()}
      </div>
    </>
  )
}

export default Page
