// prettier-ignore
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { BigNumber, ethers } from 'ethers'

import { Subscription_SuperApp } from '~common/generated/contract-types'
import hardhatDeployedContractsJson from '~common/generated/hardhat_contracts.json'

type Subscription = {
  active: boolean
  passBalance: BigNumber
  balanceTimestamp: BigNumber
  flowRate: BigNumber
  tier: BigNumber
  toNextTier: BigNumber
  availableTiers: BigNumber[]
}

interface SubState {
  subscriptions: Subscription[]
  loading: boolean
  initiated: boolean
}

// Define the initial state using that type
const initialState: SubState = {
  subscriptions: [],
  loading: false,
  initiated: false,
}

const SSAJson = hardhatDeployedContractsJson[5][0].contracts.Subscription_SuperApp as { address: string; abi: [] }
const provider = new ethers.providers.AlchemyProvider('goerli', process.env.NEXT_PUBLIC_KEY_ALCHEMY)
const SSA = new ethers.Contract(SSAJson.address, SSAJson.abi, provider) as Subscription_SuperApp

const initSubscriptions = createAsyncThunk('sub/initSubs', async (account: string, _thunkAPI) => {
  try {
    const balance = (await SSA.balanceOf(account)).toNumber()
    const tokenIdPromises = Array(balance)
      .fill('X')
      .map((_, i) => SSA.tokenOfOwnerByIndex(account, i))
    const tokenIds = (await Promise.all(tokenIdPromises)).map((bn: BigNumber) => bn.toNumber())

    const passData = await Promise.all(tokenIds.map((id) => SSA.getPassdata(id)))

    console.log(passData)

    return passData
  } catch (e) {
    console.error('error', e)
    return []
  }
})

export const subSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    resetSubs: (state) => {
      console.log('RESET SUB STATE')

      state.loading = false
      state.initiated = false
      state.subscriptions = []
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initSubscriptions.fulfilled, (state, action) => {
      console.log('fulfilled')
      console.log(action)
      const { payload } = action

      state.subscriptions = payload.map((p) => ({
        active: p.active,
        passBalance: p.passBalance,
        balanceTimestamp: p.balanceTimestamp,
        flowRate: p.flowRate,
        tier: p.tier,
        toNextTier: p.toNextTier,
        availableTiers: [BigNumber.from('0')],
      }))

      state.loading = false
      state.initiated = true
    })
    builder.addCase(initSubscriptions.pending, (state) => {
      state.loading = true
    })
    builder.addCase(initSubscriptions.rejected, (state) => {
      state.loading = false
    })
  },
})

const { resetSubs } = subSlice.actions

export { initSubscriptions, resetSubs }
export default subSlice.reducer
