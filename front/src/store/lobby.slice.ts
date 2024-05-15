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
		startGame: (_) => {},
		startGameData: (state, action) => {
			// console.log("action = ", action)
			state.gameStarted = true;
			state.opponentsGames = action.payload.opponentsGames;
			state.playerGame = action.payload.playerGame;
			state.pieces = action.payload.pieces;
			// console.log("opponentsGames = ", state.opponentsGames)
		},
		moveStateDown: (state) => {
			// const { gameIdx } = action.payload;
			// console.log("STATE BEFORE = ", state.games, " - gameIdx = ", gameIdx)
			console.info("STATE PIECES = ", state.pieces)
			state.playerGame = moveDown(state.playerGame, state)
			// state = Object.assign(state, {
			// 	...state,
			// 	games: [...state.games.map((game, idx) => {
			// 		console.log("IDX = ", idx)
			// 		if (idx === gameIdx) {
			// 			return Object.assign(game, moveDown(game, state))
			// 			// return moveDown(game)
			// 		}
			// 		return game;
			// 	})]
			// })
			// console.log("STATE AFTER = ", state.games)
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
		commandPressed: (state, action: { payload: { command: COMMANDS} }) => {
			const { command } = action.payload;
			// console.log("BEFORE POS", {...state, state. });
			const playerGame = {...state.playerGame}
			switch (command) {
				case COMMANDS.KEY_UP:
					state.pieces = [...state.pieces.map((piece, idx) => {
						if (idx === 0 && piece) {
							return rotate(playerGame.board, piece)
						}
						return piece;
					})]
				    // state = Object.assign(state, {
					// 	...state,
					// 	games: [...state.games.map((game, idx) => {
					// 		if (idx === gameIdx) {
					// 			return {
					// 				...game,
					// 				pieces: [...game.pieces.map((piece, idx) => {
					// 					if (idx === 0) {
					// 						return rotate(game.board, piece)
					// 					}
					// 					return piece;
					// 				})]
					// 			}
					// 		}
					// 		return game;
					// 	})]
					// })
				    break;
				case COMMANDS.KEY_DOWN:
					state.playerGame = moveDown(playerGame, state)
				    // state = Object.assign(state, {
					// 	...state,
					// 	games: [...state.games.map((game, idx) => {
					// 		console.log("IDX = ", idx)
					// 		if (idx === gameIdx) {
					// 			return Object.assign(game, moveDown(game, state))
					// 			// return moveDown(game)
					// 		}
					// 		return game;
					// 	})]
					// })
				    break;
				case COMMANDS.KEY_LEFT:
				    state = changeStatePiecePosition(state, moveToLeft);
					break;
				case COMMANDS.KEY_RIGHT:
				    state = changeStatePiecePosition(state, moveToRight);
					break;
				default:
					state.playerGame = hardDrop(playerGame, state)
					// state = Object.assign(state, {
					// 	...state,
					// 	games: [...state.games.map((game, idx) => {
					// 		console.log("IDX = ", idx)
					// 		if (idx === gameIdx) {
					// 			return Object.assign(game, hardDrop(game, state))
					// 			// return moveDown(game)
					// 		}
					// 		return game;
					// 	})]
					// })
					break;
			}
			// console.log("STATE = ", state);
		},
		updateGamesBoard: (state, action) => {
			state.opponentsGames = [...action.payload];
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
	startGameData,
	updateGamesBoard,
	commandPressed,
	moveStateDown,
	updatePieces
} = lobbySlice.actions;

export default lobbySlice.reducer;
