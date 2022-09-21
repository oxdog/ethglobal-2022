import { SignalIcon } from '@heroicons/react/24/outline'
// @ts-expect-error
import LitJsSdk from '@lit-protocol/sdk-browser'
import Cookies from 'cookies'
import { useEthersAppContext } from 'eth-hooks/context'
import { ethers } from 'ethers'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { AiOutlineLoading } from 'react-icons/ai'
import { FaLock, FaUnlock } from 'react-icons/fa'
import { Subscription_SuperApp } from '~common/generated/contract-types'
import { EMOJIS, SSAJson, SUBSTATION_WHITELIST } from '~~/helpers/constants'
import { generateEvmContractConditions } from '~~/helpers/generateEvmContractConditions'
import { getSigningMsg } from '~~/helpers/getSigningMsg'
import { useLitClient } from '~~/hooks/useLitClient'
import { EncryptedData } from '~~/pages/substation'
import { useAppSelector } from '~~/redux/hooks'
import { ClipString } from '../ClipString'
import { ShortAddress } from '../ShortAddress'
import { FilePost } from './FilePost'
import { GalleryPost } from './GalleryPost'
import { TextPost } from './TextPost'
import { VideoPost } from './VideoPost'

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const sub = query.sub as string
  const cookies = new Cookies(req, res)
  const jwt = cookies.get('lit-auth')

  let tierData: any[] = []

  if (!jwt || !SUBSTATION_WHITELIST.includes(sub)) {
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

interface SubstationFeedPageProps {
  authorized: boolean
  tierData: EncryptedData[]
}

export type Post = { type: 'file' | 'video' | 'text' | 'gallery'; heading: string; content: string; date: string }

export const SubstationFeedPage: React.FC<SubstationFeedPageProps> = ({ tierData, authorized }) => {
  const router = useRouter()

  const sub = useAppSelector((state) => {
    if (Object.keys(router.query).includes('sub')) {
      return state.subs.subscriptions.filter((s) => s.address === router.query.sub)[0]
    } else {
      return undefined
    }
  })

  const [decryptedPosts, setDecryptedPosts] = useState<Record<string, Array<Post>>>({})
  const [selectedTier, setSelectedTier] = useState<number>(0)
  const [inDecoding, setInDecoding] = useState<number>(-1)

  useEffect(() => console.log('subscription', sub), [sub])

  const chain = 'goerli'
  const evmContractConditions = generateEvmContractConditions(SSAJson.address, chain, 0)

  const client = useLitClient()
  const context = useEthersAppContext()

  useEffect(() => {
    console.log('tierData', tierData)
  }, [tierData])

  const decrypt = async (tierId: number) => {
    if (!client) {
      console.log('no client')
      return
    }

    try {
      setInDecoding(tierId)

      const msg = getSigningMsg(context.account!, context.chainId!)
      const sig = await context.signer?.signMessage(msg)
      const authSig = {
        sig: sig,
        derivedVia: 'web3.eth.personal.sign',
        signedMessage: msg,
        address: context.account,
      }

      const enData = tierData[tierId]

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
    } finally {
      setInDecoding(-1)
    }
  }

  const renderTierData = (tierId: number) => {
    const posts = decryptedPosts[`tier${tierId}`]

    if (posts) {
      return (
        <div key={tierId} className="flex flex-col items-center space-y-8">
          {posts.map((post) => {
            switch (post.type) {
              case 'text':
                return <TextPost post={post} />
              case 'file':
                return <FilePost post={post} />
              case 'video':
                return <VideoPost post={post} />
              case 'gallery':
                return <GalleryPost post={post} />
            }
          })}
        </div>
      )
    }
  }

  const renderUnlockPrompt = (tierId: number) => (
    <div className="flex flex-col items-center space-y-16">
      <div className="flex flex-col items-center space-y-8">
        <div className="text-4xl text-start uppercase tracking-widest font-bold">Tier {tierId + 1}</div>
        <div className="text-xl text-start uppercase tracking-widest font-bold">
          Please sign the message to decrypt the content
        </div>
      </div>

      <button
        onClick={() => decrypt(tierId)}
        // disabled={loading}
        type="button"
        className={
          'inline-flex items-center cursor-pointer w-min px-6 py-3 border transition-colors border-transparent text-base font-medium rounded-full shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
        }>
        {inDecoding === tierId ? (
          <>
            <AiOutlineLoading className="w-6 h-6 mr-2 animate-spin" /> <div>Unlocking...</div>
          </>
        ) : (
          <>
            <FaLock className="mr-4 text-xl" /> <div>Unlock</div>
          </>
        )}
      </button>
    </div>
  )
  return (
    <div className="flex space-x-8">
      <div className="relative flex flex-col w-full max-w-3xl space-y-12 py-12 bg-white">
        <div className="flex flex-col space-y-12">
          {authorized && (
            <div className="fixed top-6 -ml-4 -mt-6 pt-6 pl-4 bg-white w-full z-30">
              <div className="text-3xl flex items-center text-start uppercase break-all tracking-widest font-bold">
                <ClipString maxLength={15} text={sub?.name || ''} />
                <SignalIcon className="w-8 h-8 ml-2 mt-1" />
              </div>

              <a
                href={`https://goerli.etherscan.io/address/${sub?.address}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm flex items-center pb-4 text-start text-gray-400 uppercase break-all tracking-widest font-bold">
                <ShortAddress address={sub?.address || ''} />
              </a>
              <div className="h-4 absolute -bottom-4 w-full bg-gradient-to-b from-white to-transparent" />
            </div>
          )}

          {/* Posts */}
          {authorized ? (
            <div className="w-full">
              {tierData.map((data) => {
                const isSelected = selectedTier === data.tier
                if (decryptedPosts[`tier${data.tier}`]) {
                  return <div className={isSelected ? '' : 'hidden'}>{renderTierData(data.tier)}</div>
                } else {
                  return <div className={isSelected ? '' : 'hidden'}>{renderUnlockPrompt(data.tier)}</div>
                }
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-8 pt-48">
              <div className="text-4xl text-start uppercase tracking-widest font-bold">Substation Locked</div>
              <div className="text-xl text-start uppercase tracking-widest font-bold">
                {"You don't have access or the Substation was not found"}
              </div>
              <div className="flex flex-col items-start text-lg text-start uppercase tracking-widest font-semibold space-y-2">
                <div>1. Go to Home </div>
                <div>2. Connect your wallet</div>
                <div>3. Unlock Substation via Supersub</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed right-0 top-0 text-7xl transform scale-[3] -rotate-12 opacity-50 pointer-events-none z-40">
        {EMOJIS[sub?.address || '']}
      </div>

      {/* Navigation */}
      {authorized && (
        <div className="flex flex-col flex-none w-48 space-y-4">
          <div className="sticky right-8 top-6 w-48 space-y-4 z-40">
            <div className="text-2xl text-start uppercase tracking-widest bg-white bg-opacity-50 font-bold">
              Navigation
            </div>

            <div className="space-y-4">
              {tierData.map((_, i) => (
                <div
                  key={`nav${i}`}
                  onClick={() => setSelectedTier(i)}
                  className="group relative flex items-center w-full cursor-pointer border-green-400 px-6 h-12 text-gray-800 bg-gray-50 ">
                  <div
                    className={`absolute ${
                      selectedTier === i ? 'bg-green-400' : 'bg-gray-100 group-hover:bg-green-200'
                    } inset-y-0 w-2 left-0`}
                  />

                  {decryptedPosts[`tier${i}`] ? (
                    <FaUnlock className="mr-4 text-xl text-gray-400" />
                  ) : (
                    <FaLock className="mr-4 text-xl text-gray-500" />
                  )}
                  <div className="text-xl uppercase font-semibold tracking-widest">Tier {i + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SubstationFeedPage
