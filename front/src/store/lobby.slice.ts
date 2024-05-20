import { createSlice } from '@reduxjs/toolkit';
import { defaultLobby } from '../types/lobby.type';
import { COMMANDS } from '../types/command.types';
import {
	moveToLeft,
	moveToRight,
	changeStatePiecePosition,
	rotate,
	moveDown,
	hardDrop,
} from '../utils/piece.utils';

export const lobbySlice = createSlice({
	name: 'lobby',
	initialState: defaultLobby,
	reducers: {
		setLobby: (_, action) => action.payload,
		createLobby: (_, __) => {},
		leaveLobby: (_, __) => {},
		joinLobby: (_, __) => {},
		startGame: (_) => {},
		startGameData: (state, action) => {
			const { playerGame, opponentsGames, pieces } = action.payload;
			Object.assign(state, { playerGame, opponentsGames, pieces, gameStarted: true });
		},
		moveStateDown: moveDown,
		commandPressed: (state, action: { payload: { command: COMMANDS} }) => {
			const { command } = action.payload;
			switch (command) {
				case COMMANDS.KEY_UP:
					rotate(state)
				    break;
				case COMMANDS.KEY_DOWN:
					moveDown(state)
				    break;
				case COMMANDS.KEY_LEFT:
				    changeStatePiecePosition(state, moveToLeft);
					break;
				case COMMANDS.KEY_RIGHT:
				    changeStatePiecePosition(state, moveToRight);
					break;
				case COMMANDS.KEY_SPACE:
					hardDrop(state)
					break;
				default:
					break;
			}
		},
		updateGamesBoard: (state, action) => {
			state.opponentsGames = [...action.payload.opponentsGames];
		},
		updatePieces: (state, action) => {
			const piecesToAdd = action.payload;
			state.pieces = [...state.pieces, ...piecesToAdd];
		},
	},
});

export const {
	setLobby,
	createLobby,
	leaveLobby,
	joinLobby,
	startGame,
	startGameData,
	updateGamesBoard,
	commandPressed,
	moveStateDown,
	updatePieces,
} = lobbySlice.actions;

export default lobbySlice.reducer;
