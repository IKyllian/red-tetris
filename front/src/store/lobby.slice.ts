import { createSlice } from '@reduxjs/toolkit';
import { defaultLobby } from 'front/types/lobby.type';

export const lobbySlice = createSlice({
	name: 'lobby',
	initialState: defaultLobby,
	reducers: {
		setLobby: (state, action) => {
			return {...state, ...action.payload}
		},
		createLobby: (_, __) => {},
		leaveLobby: (_, __) => defaultLobby,
		joinLobby: (_, __) => {},
		sendStartGame: (_, __) => {},
		setGameStarted: (state, action: { payload: boolean }) => {
			state.gameStarted = action.payload;
			state.leaderboard = null
		},
		onAllGamesOver: (state, action) => {
			state.gameStarted = false;
			state.leaderboard = action.payload;
		},
	},
});

export const {
	setLobby,
	createLobby,
	leaveLobby,
	joinLobby,
	setGameStarted,
	sendStartGame,
	onAllGamesOver,
} = lobbySlice.actions;

export default lobbySlice.reducer;
