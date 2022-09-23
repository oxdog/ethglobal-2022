/* eslint-disable unused-imports/no-unused-vars-ts */
import Cookies from 'js-cookie'
import { FC, useState } from 'react'
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
import { oxdogStation } from '~~/helpers/constants'
import { generateEvmContractConditions } from '~~/helpers/generateEvmContractConditions'
import { getJWTResourceId } from '~~/helpers/getJWTResourceId'
import { getSigningMsg } from '~~/helpers/getSigningMsg'
import { useClearCookiesOnDisconnect } from '~~/hooks/useClearCookiesOnDisconnect'
import { useLitClient } from '~~/hooks/useLitClient'
import { useLoadUserOnWalletConnect } from '~~/hooks/useLoadUserOnWalletConnect'

type EncryptedData = {
  encryptedString: string
  encryptedSymmetricKey: string
}

const OXDOG_DATA = {
  tier1_data: {
    posts: [
      {
        type: 'file',
        heading: 'Files? Yes secret files',
        content:
          'Via the Substation the creator can share files or whole code directories to all Supersub holders with the defined tier. This can range from simple code snippets to whole secret projects or other files.',
        date: 'Mon Sep 21 2022',
      },
      {
        type: 'video',
        heading: 'What a secret video?',
        content:
          'Videos? Yes, of course! It would only be a proper feed if the Substation owner could upload a video. So enjoy this secret video I put in here for you.',
        date: 'Mon Sep 20 2022',
      },
      {
        type: 'text',
        heading: 'Supersub is Alpha',
        content:
          'The owner can also create tweet like posts to share some insight or takes on a specific topic. Perhaps even some alpha.',
        date: 'Mon Sep 20 2022',
      },
      {
        type: 'gallery',
        heading: 'YES! Images.',
        content:
          'As important as videos are images in feeds. Be it random emojis that fake the pictures because there was the need to put them in quickly or actual images, they can definitely be postet in a Substation.',
        date: 'Mon Sep 14 2022',
      },
      {
        type: 'text',
        heading: 'Are you reading all Posts?',
        content: 'If you read this you are taking a good look at Supersub Demo, I like you.',
        date: 'Mon Sep 13 2022',
      },
    ],
  },
  tier2_data: {
    posts: [
      {
        type: 'text',
        heading: 'Some alpha lorem ipsum',
        content:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat ducimus numquam ad, fugit odio voluptatibus repellat minima architecto et cum velit. Saepe rem molestias dolore neque accusamus odio, eum consequuntur!',
        date: 'Mon Sep 21 2022',
      },
      {
        type: 'text',
        heading: 'More lorem ipsum',
        content:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat ducimus numquam ad, fugit odio voluptatibus repellat minima architecto et cum velit. Saepe rem molestias dolore neque accusamus odio, eum consequuntur!',
        date: 'Mon Sep 21 2022',
      },
      {
        type: 'text',
        heading: 'More lorem ipsum',
        content:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat ducimus numquam ad, fugit odio voluptatibus repellat minima architecto et cum velit. Saepe rem molestias dolore neque accusamus odio, eum consequuntur!',
        date: 'Mon Sep 21 2022',
      },
      {
        type: 'text',
        heading: 'More lorem ipsum',
        content:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat ducimus numquam ad, fugit odio voluptatibus repellat minima architecto et cum velit. Saepe rem molestias dolore neque accusamus odio, eum consequuntur!',
        date: 'Mon Sep 21 2022',
      },
    ],
  },
  tier3_data: {
    posts: [
      {
        type: 'text',
        heading: 'Some alpha lorem ipsum',
        content:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat ducimus numquam ad, fugit odio voluptatibus repellat minima architecto et cum velit. Saepe rem molestias dolore neque accusamus odio, eum consequuntur!',
        date: 'Mon Sep 21 2022',
      },
      {
        type: 'text',
        heading: 'More lorem ipsum',
        content:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat ducimus numquam ad, fugit odio voluptatibus repellat minima architecto et cum velit. Saepe rem molestias dolore neque accusamus odio, eum consequuntur!',
        date: 'Mon Sep 21 2022',
      },
      {
        type: 'text',
        heading: 'More lorem ipsum',
        content:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat ducimus numquam ad, fugit odio voluptatibus repellat minima architecto et cum velit. Saepe rem molestias dolore neque accusamus odio, eum consequuntur!',
        date: 'Mon Sep 21 2022',
      },
      {
        type: 'text',
        heading: 'More lorem ipsum',
        content:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat ducimus numquam ad, fugit odio voluptatibus repellat minima architecto et cum velit. Saepe rem molestias dolore neque accusamus odio, eum consequuntur!',
        date: 'Mon Sep 21 2022',
      },
    ],
  },
}

const BREAD_DATA = {
  tier1_data: {
    posts: [
      {
        type: 'text',
        heading: 'Substation just about Everything',
        content:
          'Because anyone can create a Substation, there is no limit to what kind Substations you can subscribe to.',
        date: 'Mon Sep 20 2022',
      },
      {
        type: 'text',
        heading: 'Yes, bread.',
        content:
          'This Substation is about bread, because why not. Bread is good. Not all humans can eat it because allergies, but still, bread is good.',
        date: 'Mon Sep 20 2022',
      },
      {
        type: 'video',
        heading: 'Watch the secret video again',
        content:
          'We all need a good tune on the side sometimes when scrolling through a wonderful hackathon project. Listen to it again.',
        date: 'Mon Sep 20 2022',
      },
      {
        type: 'text',
        heading: 'I put in a surprise in Tier 2',
        content: 'Maybe you find a way to reach Tier 2 faster. If you do there is a surprise waiting for you.',
        date: 'Mon Sep 20 2022',
      },
    ],
  },
  tier2_data: {
    posts: [
      {
        type: 'text',
        heading: 'Alpha Bread Recipie',
        content: 'Baquette + Butter + Ham + Chees',
        date: 'Mon Sep 21 2022',
      },
      {
        type: 'text',
        heading: 'Bread is Craving',
        content: 'When you are on a cut you might develop cravings for bread - information from a trusted source.',
        date: 'Mon Sep 21 2022',
      },
    ],
  },
}

const MEV_DATA = {
  tier1_data: {
    posts: [
      {
        type: 'text',
        heading: 'Gas saving',
        content: 'Perhaps some gas saving technique like directly using pools when trading doing DEX arbitrage.',
        date: 'Mon Sep 20 2022',
      },
      {
        type: 'text',
        heading: 'Alpha',
        content:
          'Or some other alpha like protocol xyz released a new governance post to change some things which results in long tail mev',
        date: 'Mon Sep 20 2022',
      },
    ],
  },
  tier2_data: {
    posts: [
      {
        type: 'text',
        heading: 'Alpha',
        content: 'Or some more insight like stETH trading for a discount which might expose some mev',
        date: 'Mon Sep 20 2022',
      },
      {
        type: 'file',
        heading: 'Secret MEV Bot',
        content: 'Here, have my MEV bot',
        date: 'Mon Sep 21 2022',
      },
    ],
  },
  tier3_data: {
    posts: [
      {
        type: 'text',
        heading: 'For the High Tier Subscribers',
        content:
          'To reward your subscribers that already paid a lot for their subscription why not share some code you wrote to improve their mev bots.',
        date: 'Mon Sep 20 2022',
      },
      {
        type: 'file',
        heading: 'Secret MEV Bot',
        content: 'Here, have my MEV bot',
        date: 'Mon Sep 21 2022',
      },
    ],
  },
}

// const { tier1_data, tier2_data, tier3_data } = OXDOG_DATA
// const substationData = [tier1_data, tier2_data, tier3_data]
const SSAAddress = oxdogStation.address

// const { tier1_data, tier2_data } = BREAD_DATA
// const substationData = [tier1_data, tier2_data]
// const SSAAddress = breadStation.address

const { tier1_data, tier2_data, tier3_data } = MEV_DATA
const substationData = [tier1_data, tier2_data, tier3_data]
// const SSAAddress = mevStation.address

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

  const chain = 'mumbai'

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
      const evmContractConditions = generateEvmContractConditions(SSAAddress, chain, 0)

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

    const encryptedData = await Promise.all(
      substationData.map(async (tierData, i) => {
        const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(JSON.stringify(tierData))
        const evmContractConditions = generateEvmContractConditions(SSAAddress, chain, i)

        console.log('evmContractConditions tier ', i, '\n', evmContractConditions)

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
    const resourceId = getJWTResourceId(SSAAddress)

    if (!client) {
      console.log('no client')
      return
    }
    // const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain })
    const evmContractConditions = generateEvmContractConditions(SSAAddress, chain, 0)

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
    const resourceId = getJWTResourceId(SSAAddress)
    const evmContractConditions = generateEvmContractConditions(SSAAddress, chain, 0)

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
