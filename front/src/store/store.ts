import { configureStore } from '@reduxjs/toolkit';
import PlayerReducer from 'front/store/player.slice';
import SocketReducer from 'front/store/socket.slice';
import socketMiddleware from 'front/store/socketMiddleware';
import LobbyReducer from 'front/store/lobby.slice';
import GameReducer from 'front/store/game.slice';
import inputMiddleware from 'front/store/inputMiddleware';
import logger from 'redux-logger';

export const store = configureStore({
	reducer: {
		player: PlayerReducer,
		socket: SocketReducer,
		lobby: LobbyReducer,
		game: GameReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({ serializableCheck: false }).concat(
			socketMiddleware,
			inputMiddleware
			// logger
		),
	devTools: true,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type
export type AppDispatch = typeof store.dispatch;
