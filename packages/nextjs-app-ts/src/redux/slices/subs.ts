// prettier-ignore
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BigNumber, ethers } from 'ethers'
import _ from 'lodash'

import { Subscription_SuperApp } from '~common/generated/contract-types'
import { breadStation, mevStation, oxdogStation, SSAJson } from '~~/helpers/constants'

export type TSubscription = {
  name: string
  w3name: string
  address: string
  active: boolean
  passBalance: string
  balanceTimestamp: string
  flowRate: string
  tier: number
  toNextTier: string
  availableTiers: string[]
}

interface SubState {
  subscriptions: TSubscription[]
  loading: boolean
  initiated: boolean
}

// Define the initial state using that type
const initialState: SubState = {
  subscriptions: [],
  loading: false,
  initiated: false,
}

const provider = new ethers.providers.AlchemyProvider('maticmum', process.env.NEXT_PUBLIC_KEY_ALCHEMY)
const OXDOG_SSA = new ethers.Contract(oxdogStation.address, SSAJson.abi, provider) as Subscription_SuperApp
const BREAD_SSA = new ethers.Contract(breadStation.address, SSAJson.abi, provider) as Subscription_SuperApp
const MEV_SSA = new ethers.Contract(mevStation.address, SSAJson.abi, provider) as Subscription_SuperApp

const initSubscriptions = createAsyncThunk('sub/initSubs', async (account: string, _thunkAPI) => {
  try {
    const loadSSA = async (SSA: Subscription_SuperApp) => {
      const generalInfo = await SSA.generalInfo()
      const balance = (await SSA.balanceOf(account)).toNumber()
      const tokenIdPromises = Array(balance)
        .fill('X')
        .map((_, i) => SSA.tokenOfOwnerByIndex(account, i))
      const tokenIds = (await Promise.all(tokenIdPromises)).map((bn: BigNumber) => bn.toNumber())
      const passData = await Promise.all(tokenIds.map((id) => SSA.getPassdata(id)))

      return _.map(passData, (p) => ({
        name: generalInfo.subName,
        w3name: generalInfo.subW3name,
        address: SSA.address,
        active: p.active,
        passBalance: p.passBalance.toString(),
        balanceTimestamp: p.balanceTimestamp.toString(),
        flowRate: p.flowRate.toString(),
        tier: p.tier.toNumber(),
        toNextTier: p.toNextTier.toString(),
        availableTiers: _.map(generalInfo.subTiers, (t) => t.toString()),
      })) as Array<TSubscription>
    }

    const allPassData = await Promise.all([OXDOG_SSA, BREAD_SSA, MEV_SSA].map((SSA) => loadSSA(SSA)))

    return _.flatten(allPassData).sort((a, _b) => (a.active ? -1 : 1))
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
      state.loading = false
      state.initiated = false
      state.subscriptions = []
    },
    pauseSub: (state, action: PayloadAction<{ address: string; balance: string }>) => {
      const filter = action.payload
      state.subscriptions = _.map(state.subscriptions, (sub) => {
        if (sub.address === filter.address || sub.passBalance === filter.balance) {
          return {
            ...sub,
            active: false,
            flowRate: '0',
          }
        } else {
          return sub
        }
      })
    },
    triggerReload: (state) => {
      state.initiated = false
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initSubscriptions.fulfilled, (state, action) => {
      const { payload } = action
      state.subscriptions = payload
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

const { resetSubs, pauseSub, triggerReload } = subSlice.actions

export { initSubscriptions, resetSubs, pauseSub, triggerReload }
export default subSlice.reducer
