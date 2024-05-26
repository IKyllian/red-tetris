import { createSlice } from '@reduxjs/toolkit';
import { defaultLobby } from '../types/lobby.type';
import // moveToLeft,
// moveToRight,
// changeStatePiecePosition,
// rotate,
// moveDown,
// hardDrop,
// clearOldPosition,
// transferPieceToBoard,
'../utils/piece.utils';
import { IGame } from '../types/board.types';
import {
	IGameUpdatePacketHeader,
	IPositionUpdate,
	UpdateType,
} from '../types/packet.types';
import {
	getShape,
	clearOldPosition,
	transferPieceToBoard,
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
		// sendInputs: (_, __) => {},
		startGameData: (state, action) => {
			const { playerGame, opponentsGames, seed } = action.payload;
			Object.assign(state, {
				playerGame,
				opponentsGames,
				seed,
				gameStarted: true,
			});
		},
		onAllGamesOver: (state, action) => {
			state.gamesOver = true;
			state.leaderboard = action.payload;
		},
		// moveStateDown: moveDown,
		// commandPressed: (state, action: { payload: { command: COMMANDS } }) => {
		// 	const { command } = action.payload;
		// 	switch (command) {
		// 		case COMMANDS.KEY_UP:
		// 			rotate(state);
		// 			break;
		// 		case COMMANDS.KEY_DOWN:
		// 			moveDown(state);
		// 			break;
		// 		case COMMANDS.KEY_LEFT:
		// 			changeStatePiecePosition(state, moveToLeft);
		// 			break;
		// 		case COMMANDS.KEY_RIGHT:
		// 			changeStatePiecePosition(state, moveToRight);
		// 			break;
		// 		case COMMANDS.KEY_SPACE:
		// 			hardDrop(state);
		// 			break;
		// 		default:
		// 			break;
		// 	}
		// },
		updatePlayerGame: (state, action) => {
			state.playerGame = action.payload;
		},
		// updateGamesBoard: (
		// 	state,
		// 	action: { payload: IGameUpdatePacketHeader }
		// ) => {
		// 	const packetWhithHeader = action.payload;
		// 	const gamePackets = packetWhithHeader.gamePackets;
		// 	for (const gamePacket of gamePackets) {
		// 		if (gamePacket.state.player.id === state.playerGame.player.id) {
		// 			continue;
		// 		}

		// 		const index = state.opponentsGames.findIndex(
		// 			(g) => g.player.id === gamePacket.state.player.id
		// 		);
		// 		// let currentState = state.opponentsGames[index];
		// 		let currentState: IGame = state.opponentsGames.find((g) => {
		// 			return g.player.id === gamePacket.state.player.id;
		// 		});
		// 		if (
		// 			currentState &&
		// 			gamePacket.updateType === UpdateType.POSITION
		// 		) {
		// 			const newState = gamePacket.state as IPositionUpdate;
		// 			const piece = currentState.pieces[0];
		// 			let shape = getShape(piece.type, piece.rotationState);
		// 			//why is it working
		// 			clearOldPosition(piece, shape, currentState.board);
		// 			if (piece.rotationState !== newState.piece.rotationState) {
		// 				shape = getShape(
		// 					newState.piece.type,
		// 					newState.piece.rotationState
		// 				);
		// 			}
		// 			transferPieceToBoard(
		// 				currentState.board,
		// 				newState.piece,
		// 				shape,
		// 				false
		// 			);
		// 			currentState.pieces[0] = newState.piece;
		// 		} else if (
		// 			currentState &&
		// 			gamePacket.updateType === UpdateType.GAME
		// 		) {
		// 			const newState = gamePacket.state as IGame;
		// 			currentState = newState;
		// 			state.opponentsGames[index] = currentState;
		// 		}
		// 	}
		// },
	},
});

export const {
	setLobby,
	createLobby,
	leaveLobby,
	joinLobby,
	startGame,
	startGameData,
	// updateGamesBoard,
	// moveStateDown,
	onAllGamesOver,
	// sendInputs,
	updatePlayerGame,
} = lobbySlice.actions;

export default lobbySlice.reducer;
