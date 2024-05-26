import { configureStore } from '@reduxjs/toolkit';
import PlayerReducer from './player.slice';
import BoardReducer from './board.slice';
import SocketReducer from './socket.slice';
import socketMiddleware from './socketMiddleware';
import LobbyReducer from './lobby.slice';
import TickReducer from './tick.slice';
import GameReducer from './game.slice';
import inputMiddleware from './inputMiddleware';

export const store = configureStore({
	reducer: {
		player: PlayerReducer,
		board: BoardReducer,
		socket: SocketReducer,
		lobby: LobbyReducer,
		tick: TickReducer,
		game: GameReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({ serializableCheck: false }).concat(
			socketMiddleware,
			inputMiddleware
		),
	devTools: true,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type
export type AppDispatch = typeof store.dispatch;
