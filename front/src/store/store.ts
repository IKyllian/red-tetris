import { configureStore } from '@reduxjs/toolkit'
import PlayerReducer from './player.slice'
import BoardReducer from './board.slice'
import SocketReducer from './socket.slice'
import socketMiddleware from './socketMiddleware'

export const store = configureStore({
  reducer: {
    player: PlayerReducer,
    board: BoardReducer,
    socket: SocketReducer
  },
  middleware(getDefaultMiddleware) {
    return getDefaultMiddleware().concat([socketMiddleware]);
  }
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type
export type AppDispatch = typeof store.dispatch