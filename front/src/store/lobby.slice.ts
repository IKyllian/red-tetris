import { createSlice } from '@reduxjs/toolkit';
import { defaultLobby } from '../types/lobby.type';
import { COMMANDS } from '../types/command.types';
import { moveToBottom, moveToLeft, moveToRight , changeStatePiecePosition, rotate, moveDown, hardDrop} from '../utils/piece.utils';

export const lobbySlice = createSlice({
	name: 'lobby',
	initialState: defaultLobby,
	reducers: {
		setLobby: (state, action) => {
			state = Object.assign(state, action.payload);
		},
		createLobby: (_, __) => { },
		leaveLobby: (_, __) => { },
		joinLobby: (_, __) => { },
		startGame: (state, action) => {
			state.gameStarted = true;
			state.games = action.payload.games;
			state.pieces = action.payload.pieces;
		},
		moveStateDown: (state, action) => {
			const { gameIdx } = action.payload;
			console.log("STATE BEFORE = ", state.games, " - gameIdx = ", gameIdx)
			state = Object.assign(state, {
				...state,
				games: [...state.games.map((game, idx) => {
					console.log("IDX = ", idx)
					if (idx === gameIdx) {
						return Object.assign(game, moveDown(game, state))
						// return moveDown(game)
					}
					return game;
				})]
			})
			console.log("STATE AFTER = ", state.games)
		},
		// drawDropPosition: (state, action) => {
		// 	const { gameIdx } = action.payload;
		// 	state = Object.assign(state, {
		// 		...state,
		// 		games: [...state.games.map((game, idx) => {
		// 			console.log("IDX = ", idx)
		// 			if (idx === gameIdx) {
		// 				return Object.assign(game, drawDropPosition(game))
		// 				// return moveDown(game)
		// 			}
		// 			return game;
		// 		})]
		// 	})
			
		// },
		commandPressed: (state, action: { payload: { command: COMMANDS, gameIdx: number } }) => {
			const { gameIdx, command } = action.payload;
			// console.log("BEFORE POS", {...state, state. });
			switch (command) {
				case COMMANDS.KEY_UP:
				    state = Object.assign(state, {
						...state,
						games: [...state.games.map((game, idx) => {
							if (idx === gameIdx) {
								return {
									...game,
									pieces: [...game.pieces.map((piece, idx) => {
										if (idx === 0) {
											return rotate(game.board, piece)
										}
										return piece;
									})]
								}
							}
							return game;
						})]
					})
				    break;
				case COMMANDS.KEY_DOWN:
				    state = Object.assign(state, {
						...state,
						games: [...state.games.map((game, idx) => {
							console.log("IDX = ", idx)
							if (idx === gameIdx) {
								return Object.assign(game, moveDown(game, state))
								// return moveDown(game)
							}
							return game;
						})]
					})
				    break;
				case COMMANDS.KEY_LEFT:
				    state = changeStatePiecePosition(state, gameIdx, moveToLeft);
					break;
				case COMMANDS.KEY_RIGHT:
				    state = changeStatePiecePosition(state, gameIdx, moveToRight);
					break;
				default:
					state = Object.assign(state, {
						...state,
						games: [...state.games.map((game, idx) => {
							console.log("IDX = ", idx)
							if (idx === gameIdx) {
								return Object.assign(game, hardDrop(game, state))
								// return moveDown(game)
							}
							return game;
						})]
					})
					break;
			}
			console.log("STATE = ", state);
		},
		updateGamesBoard: (state, action) => {
			state.games = [...action.payload];
		},
		updatePieces: (state, action) => {
			const piecesToAdd = action.payload;
			state.pieces = [...state.pieces, ...piecesToAdd];
		}
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
	moveStateDown,
	updatePieces
} = lobbySlice.actions;

export default lobbySlice.reducer;
