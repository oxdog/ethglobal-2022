import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import {
  allRpcEndpoints,
  allSubgraphEndpoints,
  createApiWithReactHooks,
  initializeRpcApiSlice,
  initializeSubgraphApiSlice,
  initializeTransactionTrackerSlice,
} from '@superfluid-finance/sdk-redux'

import subs from './slices/subs'

export const rpcApi = initializeRpcApiSlice(createApiWithReactHooks).injectEndpoints(allRpcEndpoints)
export const subgraphApi = initializeSubgraphApiSlice(createApiWithReactHooks).injectEndpoints(allSubgraphEndpoints)
export const transactionTracker = initializeTransactionTrackerSlice()

export const store = configureStore({
  reducer: {
    [rpcApi.reducerPath]: rpcApi.reducer,
    [subgraphApi.reducerPath]: subgraphApi.reducer,
    [transactionTracker.reducerPath]: transactionTracker.reducer,
    subs,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(rpcApi.middleware).concat(subgraphApi.middleware),
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>
