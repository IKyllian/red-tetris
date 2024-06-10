import { createSlice } from '@reduxjs/toolkit';
import { IGame, defaultGame } from 'front/types/board.types';
import {
	GameMode,
	IGameUpdatePacket,
	IGameUpdatePacketHeader,
	IIndestructiblePacket,
	IInputsPacket,
	IPositionUpdate,
	IServerState,
	ITickAdjustmentPacket,
	UpdateType,
} from 'front/types/packet.types';
import {
	getShape,
	clearOldPosition,
	transferPieceToBoard,
	generatePieces,
	setDropPreview,
	clearDropPreview,
} from 'front/utils/piece.utils';
import { ITetromino } from 'front/types/tetrominoes.type';
import {
	handleInput,
	hardDrop,
	moveDown,
	rotate,
} from 'front/utils/handle-inputs.utils';
import seedrandom from 'seedrandom';
import { COMMANDS } from 'front/types/command.types';
import {
	addIndestructibleLines,
	compareCells,
	getFramesPerGridCell,
} from 'front/utils/board.utils';
import SocketFactory from 'front/store/socketFactory';
import { SocketEvent } from 'front/store/socketMiddleware';
import { cloneDeep, isEqual } from 'lodash';
import { produce } from 'immer';
import {
	PIECES_BUFFER_SIZE,
	BUFFER_SIZE,
	MIN_TIME_BETWEEN_TICKS,
	handleServerReconciliation,
	softDrop,
} from 'front/utils/game.utils';

const TICK_OFFSET = 4;

export interface IGameState {
	seed: string;
	gameStarted: boolean; // TODO delete ?
	playerGame: IGame | null;
	opponentsGames: IGame[];
	opponentsUpdates: IGameUpdatePacket[];
	leaderboard: any[];
	gamesOver: boolean;
	pieces: ITetromino[];
	// pieceIndex: number;
	tick: number;
	tickToMoveDown: number;
	timer: number;
	rng: seedrandom.PRNG;
	clientStateBuffer: Array<IGame>;
	inputBuffer: Array<COMMANDS[]>;
	lastServerState: IServerState;
	lastProcessedServerState: IServerState;
	tickAdjustment: number;
	adjustmentIteration: number;
	serverAdjustmentIteration: number;
	inputQueue: COMMANDS[];
	skipPieceGeneration: number;
	indestructibleQueue: IIndestructiblePacket[];
	gravity: number;
	gameMode: GameMode;

	forceReconcileTimer: number;
	render: boolean;
}

const defaultGameState: IGameState = {
	seed: '',
	gameStarted: false,
	playerGame: null,
	opponentsGames: [],
	opponentsUpdates: [],
	leaderboard: [],
	gamesOver: false,
	pieces: new Array<ITetromino>(PIECES_BUFFER_SIZE),
	tick: 0,
	tickToMoveDown: 0,
	timer: 0,
	rng: null,
	clientStateBuffer: new Array<IGame>(BUFFER_SIZE),
	lastServerState: null,
	lastProcessedServerState: null,
	tickAdjustment: 0,
	adjustmentIteration: 0,
	serverAdjustmentIteration: 0,
	inputQueue: [],
	inputBuffer: new Array<COMMANDS[]>(BUFFER_SIZE),
	indestructibleQueue: [],
	gravity: 0.04,
	gameMode: GameMode.SOLO,

	skipPieceGeneration: 0,
	forceReconcileTimer: performance.now(),
	render: true,
};

export const gameSlice = createSlice({
	name: 'game',
	initialState: defaultGameState,
	reducers: {
		addInputToQueue(state, action) {
			if (state.tick >= 90) {
				state.inputQueue.push(action.payload);
			}
		},

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
			state.playerGame = action.payload.playerGame;
			state.gameMode = action.payload.gameMode;
			if (state.gameMode === GameMode.BATTLEROYAL) {
				state.opponentsGames = action.payload.opponentsGames;
			}
			//TODO not store seed?
			state.seed = action.payload.seed;
			state.rng = seedrandom(state.seed);
			generatePieces(state, 4);
			setDropPreview(state.playerGame.board, state.playerGame.piece);
			const shape = getShape(
				state.playerGame.piece.type,
				state.playerGame.piece.rotationState
			);
			transferPieceToBoard(
				state.playerGame.board,
				state.playerGame.piece,
				shape,
				false
			);
			state.gameStarted = true;
		},
		updateGamesBoard: (
			state,
			action: { payload: IGameUpdatePacketHeader }
		) => {
			const packetWhithHeader = action.payload;
			const gamePackets = packetWhithHeader.gamePackets;

			if (
				state.serverAdjustmentIteration !=
				packetWhithHeader.adjustmentIteration
			) {
				console.log(
					'tick adjustement: ',
					packetWhithHeader.tickAdjustment
				);
				state.tickAdjustment = packetWhithHeader.tickAdjustment;
				state.serverAdjustmentIteration =
					packetWhithHeader.adjustmentIteration;
			}
			//-------------------------------------------------------------------

			for (const gamePacket of gamePackets) {
				if (gamePacket.state.player.id === state.playerGame.player.id) {
					state.lastServerState = {
						tick: packetWhithHeader.tick,
						packet: gamePacket,
					};
					continue;
				}

				const index = state.opponentsGames.findIndex(
					(g) => g.player.id === gamePacket.state.player.id
				);
				if (
					index === -1 &&
					state.opponentsGames[index] &&
					gamePacket.updateType === UpdateType.POSITION
				) {
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
				} else if (
					state.opponentsGames[index] &&
					gamePacket.updateType === UpdateType.GAME
				) {
					state.opponentsGames[index] = gamePacket.state as IGame;
				}
			}
		},
		updatePlayerGame: (state, action) => {
			state.timer += action.payload;

			if (state.adjustmentIteration != state.serverAdjustmentIteration) {
				state.adjustmentIteration = state.serverAdjustmentIteration;
				state.inputQueue.length = 0;
				console.log('adjusting tick');
				const tickToCatchUp = state.tick + state.tickAdjustment;
				while (state.tick < tickToCatchUp) {
					softDrop(state);
					state.clientStateBuffer[state.tick % BUFFER_SIZE] = {
						...state.playerGame,
					};
					state.tick++;
				}
			}

			if (state.tick < 90) {
				while (state.timer >= MIN_TIME_BETWEEN_TICKS) {
					const instance = SocketFactory.Instance();
					const data = {
						tick: state.tick,
						adjustmentIteration: state.adjustmentIteration,
					};
					// console.log('sync with server', data);
					instance.socket.emit(SocketEvent.SyncWithServer, { data });
					state.tick++;
					state.timer -= MIN_TIME_BETWEEN_TICKS;
				}
				return;
			}

			// server reconciliation
			if (state.lastProcessedServerState !== state.lastServerState) {
				handleServerReconciliation(state);
			}
			//------------------------------------------------------------------
			const now = performance.now();
			while (state.timer >= MIN_TIME_BETWEEN_TICKS) {
				// if (state.tick === 200) {
				// 	console.log('force reconcile');
				// 	hardDrop(state);
				// 	state.forceReconcileTimer = now;
				// 	state.render = false;
				// }
				for (let i = 0; i < state.indestructibleQueue.length; i++) {
					const indestructible = state.indestructibleQueue[i];
					if (indestructible.tick === state.tick) {
						console.log('add indestructible lines');
						addIndestructibleLines(state, indestructible.nb);
						state.indestructibleQueue.splice(i, 1);
						i--;
					}
				}
				if (state.inputQueue.length > 0) {
					state.inputQueue.forEach((input) => {
						handleInput(input, state);
					});
					state.inputBuffer[state.tick % BUFFER_SIZE] = [
						...state.inputQueue,
					];

					const instance = SocketFactory.Instance();
					const data = {
						tick: state.tick,
						adjustmentIteration: state.adjustmentIteration,
						inputs: [...state.inputQueue],
					};
					instance.socket.emit(SocketEvent.CommandPressed, {
						data: data,
					});
					state.inputQueue.length = 0;
				}
				softDrop(state);

				state.clientStateBuffer[state.tick % BUFFER_SIZE] = {
					...state.playerGame,
				};

				if (state.tick && state.tick % 1800 === 0) {
					state.gravity += 0.005;
				}

				state.tick++;
				// console.log('one tick');
				state.timer -= MIN_TIME_BETWEEN_TICKS;
			}
		},
		updateIndestructibleLines(
			state,
			action: { payload: IIndestructiblePacket }
		) {
			state.indestructibleQueue.push(action.payload);
		},
		updateTickAdjustments(
			state,
			action: { payload: ITickAdjustmentPacket }
		) {
			console.log('tick adjustement: ', action.payload.tickAdjustment);
			if (
				state.adjustmentIteration != action.payload.adjustmentIteration
			) {
				state.adjustmentIteration = action.payload.adjustmentIteration;
				state.serverAdjustmentIteration = state.adjustmentIteration;
				state.tick += action.payload.tickAdjustment;
			}
		},
	},
});

export const {
	setGameStartingState,
	updateGamesBoard,
	updatePlayerGame,
	addInputToQueue,
	updateIndestructibleLines,
	updateTickAdjustments,
} = gameSlice.actions;

export default gameSlice.reducer;
