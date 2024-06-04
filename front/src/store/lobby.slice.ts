import { createSlice } from '@reduxjs/toolkit';
import { defaultLobby } from 'front/types/lobby.type';

export const lobbySlice = createSlice({
	name: 'lobby',
	initialState: defaultLobby,
	reducers: {
		setLobby: (_, action) => action.payload,
		createLobby: (_, __) => {},
		leaveLobby: (_, __) => {},
		joinLobby: (_, __) => {},
		sendStartGame: (_, __) => {},
		setGameStarted: (state, action: { payload: boolean }) => {
			state.gameStarted = action.payload;
		},
		// onAllGamesOver: (state, action) => {
		// 	state.gamesOver = true;
		// 	state.leaderboard = action.payload;
		// },
	},
});

export const {
	setLobby,
	createLobby,
	leaveLobby,
	joinLobby,
	setGameStarted,
	sendStartGame,
	// onAllGamesOver,
} = lobbySlice.actions;

export default lobbySlice.reducer;
