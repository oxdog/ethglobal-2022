import { FC, useEffect, useState } from 'react'
// @ts-expect-error
import LitJsSdk from '@lit-protocol/sdk-browser'
import Cookies from 'cookies'
import { useEthersAppContext } from 'eth-hooks/context'
import { ethers } from 'ethers'
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
import { getSigningMsg } from '~~/helpers/getSigningMsg'
import { useLitClient } from '~~/hooks/useLitClient'
import { useClearCookiesOnDisconnect } from '~~/hooks/useClearCookiesOnDisconnect'
import { useLoadUserOnWalletConnect } from '~~/hooks/useLoadUserOnWalletConnect'

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const sub = query.sub as string
  const cookies = new Cookies(req, res)
  const jwt = cookies.get('lit-auth')

  let tierData: any[] = []

  if (!jwt) {
    return {
      props: {
        authorized: false,
        tierData,
      },
    }
  }

  const { verified, payload } = LitJsSdk.verifyJwt({ jwt })

  if (payload.baseUrl !== 'supersub_replace' || payload.path !== '/substation' || payload.extraData !== sub) {
    return {
      props: {
        authorized: false,
        tierData,
      },
    }
  }

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
      authorized: verified ? true : false,
      tierData,
    },
  }
}

type EncryptedData = {
  tier: number
  encryptedString: string
  encryptedSymmetricKey: string
}

interface SubstationPageProps {
  authorized: boolean
  tierData: EncryptedData[]
}

type Post = { text: string }

const Page: FC<SubstationPageProps> = ({ tierData, authorized }) => {
  const client = useLitClient()

  useLoadUserOnWalletConnect()
  useClearCookiesOnDisconnect()

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
    console.log('tierData', tierData)
  }, [tierData])

  const decrypt = async (tierId: number) => {
    if (!client) {
      console.log('no client')
      return
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

      if (isSelected) {
        return (
          <div key={tierId} className="flex flex-col">
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
              <div className="flex space-x-4">
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
      }
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
        {!authorized ? (
          <div className="flex flex-col items-center space-x-4">
            <div>Not authorized to access substation</div>
            <a href={`/user/subscriptions`} className="hover:text-gray-400 tracking-wider cursor-pointer">
              Back to subscription
            </a>
          </div>
        ) : tierData.length === 0 ? (
          <div>Substation not found</div>
        ) : (
          renderTierData()
        )}
      </div>
    </>
  )
}

export default Page
