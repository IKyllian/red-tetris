import { createSlice } from '@reduxjs/toolkit';
import { defaultLobby } from '../types/lobby.type';

export const lobbySlice = createSlice({
	name: 'lobby',
	initialState: defaultLobby,
	reducers: {
		setLobby: (state, action) => {
			state = action.payload;
		},
		createLobby: (_, __) => {},
		leaveLobby: (_, __) => {},
		joinLobby: (_, __) => {},
		startGame: (state) => {
			state.gameStarted = true;
		},
		commandPressed: (_, __) => {},
		updateGamesBoard: (state, action) => {
			state.games = [...action.payload];
		},
	},
});

export const {
	setLobby,
	createLobby,
	leaveLobby,
	joinLobby,
	startGame,
	updateGamesBoard,
	commandPressed,
} = lobbySlice.actions;

export default lobbySlice.reducer;
