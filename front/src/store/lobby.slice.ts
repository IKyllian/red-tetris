import { createSlice } from '@reduxjs/toolkit';
import { ILobby } from 'front/types/lobby.type';

const defaultLobby = null as ILobby | null
export const lobbySlice = createSlice({
	name: 'lobby',
	initialState: defaultLobby,
	reducers: {
		setLobby: (state, action) => {
			return { ...state, ...action.payload };
		},
		createLobby: (_, __) => {},
		leaveLobby: (_, __) => defaultLobby,
		resetLobby: () => defaultLobby,
		joinLobby: (_, __) => {},
		sendStartGame: (_, __) => {},
		setGameStarted: (state, action: { payload: boolean }) => {
			return {
				...state,
                gameStarted: action.payload,
                leaderboard: null,
			}
		},
		onAllGamesOver: (state, action) => {
			return {
				...state,
                gameStarted: null,
                leaderboard: action.payload
			}
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
	resetLobby
} = lobbySlice.actions;

export default lobbySlice.reducer;
