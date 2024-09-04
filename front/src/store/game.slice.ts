import { createSlice } from '@reduxjs/toolkit';
import { IGame } from 'front/types/board.types';
import {
	GameMode,
	IGameUpdatePacket,
	IPositionUpdate,
	UpdateType,
} from 'front/types/packet.types';
import {
	getShape,
	clearOldPosition,
	transferPieceToBoard,
	setDropPreview,
	clearDropPreview,
	getNextPiece,
} from 'front/utils/piece.utils';
import { ITetromino } from 'front/types/tetrominoes.type';
import seedrandom from 'seedrandom';
import SocketFactory from 'front/store/socketFactory';
import { SocketEvent } from 'front/store/socketMiddleware';

export interface IGameState {
	seed: string;
	gameStarted: boolean;
	playerGame: IGame | null;
	opponentsGames: IGame[];
	leaderboard: any[];
	gamesOver: boolean;
	pieces: ITetromino[];
	rng: seedrandom.PRNG;
	gameMode: GameMode;
	countdown: number;
}

export const defaultGameState: IGameState = {
	seed: '',
	gameStarted: false,
	playerGame: null,
	opponentsGames: [],
	leaderboard: [],
	gamesOver: false,
	pieces: new Array<ITetromino>(),
	rng: null,
	gameMode: GameMode.SOLO,
	countdown: 3,
};

export const gameSlice = createSlice({
	name: 'game',
	initialState: defaultGameState,
	reducers: {
		leaveGame: () => {},
		addInputToQueue(_, action) {
			const instance = SocketFactory.Instance();
			const data = {
				inputs: action.payload,
			};
			instance.emit(SocketEvent.CommandPressed, {
				data: data,
			});
		},
		resetGame: () => defaultGameState,
		setGameStartingState: (
			state,
			action: {
				payload: {
					playerGame: IGame;
					gameMode: GameMode;
					seed: string;
					opponentsGames?: IGame[];
				};
			}
		) => {
			state.gamesOver = false;
			state.countdown = 3;
			state.playerGame = action.payload.playerGame;
			state.gameMode = action.payload.gameMode;
			if (state.gameMode === GameMode.BATTLEROYAL) {
				state.opponentsGames = action.payload.opponentsGames;
			}
			state.seed = action.payload.seed;
			state.pieces = new Array<ITetromino>();
			state.rng = seedrandom(state.seed);
			for (let i = 0; i < 4; i++) {
				state.pieces.push(getNextPiece(state.rng));
			}
			const shape = getShape(
				state.playerGame.piece.type,
				state.playerGame.piece.rotationState
			);
			setDropPreview(
				state.playerGame.board,
				shape,
				state.playerGame.piece
			);
			transferPieceToBoard(
				state.playerGame.board,
				state.playerGame.piece,
				shape,
				false
			);
			state.gameStarted = true;
		},
		updateGamesBoard: (state, action: { payload: IGameUpdatePacket[] }) => {
			const gamePackets = action.payload;

			if (state.gameStarted === false) {
				return;
			}
			for (const gamePacket of gamePackets) {
				if (gamePacket.state.player.id === state.playerGame.player.id) {
					const newState = gamePacket.state as IGame;
					if (
						state.playerGame.currentPieceIndex + 1 ==
						newState.currentPieceIndex
					) {
						state.pieces.shift();
						state.pieces.push(getNextPiece(state.rng));
					}
					const oldPiece = state.playerGame.piece;
					const oldShape = getShape(
						oldPiece.type,
						oldPiece.rotationState
					);
					clearDropPreview(
						state.playerGame.board,
						oldShape,
						oldPiece
					);
					clearOldPosition(
						oldPiece,
						oldShape,
						state.playerGame.board
					);

					const piece = newState.piece;
					state.playerGame = newState;
					let shape = getShape(piece.type, piece.rotationState);
					setDropPreview(
						state.playerGame.board,
						shape,
						newState.piece
					);
					transferPieceToBoard(
						state.playerGame.board,
						newState.piece,
						shape,
						false
					);
				}

				const index = state.opponentsGames.findIndex(
					(g) => g.player.id === gamePacket.state.player.id
				);
				if (index === -1) {
					continue;
				}

				if (gamePacket.updateType === UpdateType.POSITION) {
					const newState = gamePacket.state as IPositionUpdate;
					const piece = state.opponentsGames[index].piece;
					let shape = getShape(piece.type, piece.rotationState);

					clearOldPosition(
						piece,
						shape,
						state.opponentsGames[index].board
					);
					if (piece.rotationState !== newState.piece.rotationState) {
						shape = getShape(
							newState.piece.type,
							newState.piece.rotationState
						);
					}
					transferPieceToBoard(
						state.opponentsGames[index].board,
						newState.piece,
						shape,
						false
					);
					state.opponentsGames[index].piece = newState.piece;
				} else if (gamePacket.updateType === UpdateType.GAME) {
					state.opponentsGames[index] = gamePacket.state as IGame;
				}
			}
		},
		updateCountdown(state) {
			if (state.countdown > -1) {
				state.countdown--;
			}
		},
		gameOver(state) {
			if (state.playerGame) {
				state.playerGame.gameOver = true;
			}
		},
	},
});

export const {
	setGameStartingState,
	updateGamesBoard,
	addInputToQueue,
	resetGame,
	leaveGame,
	gameOver,
	updateCountdown,
} = gameSlice.actions;

export default gameSlice.reducer;
