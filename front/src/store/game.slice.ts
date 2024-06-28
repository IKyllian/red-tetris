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
	setDropPreview,
	clearDropPreview,
} from 'front/utils/piece.utils';
import { generatePieces } from 'front/utils/piece-generation.utils'
import { ITetromino } from 'front/types/tetrominoes.type';
import {
	handleInput,
	hardDrop,
	moveDown,
	rotate,
} from 'front/utils/handle-inputs.utils';
import seedrandom from 'seedrandom';
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
import { Commands } from 'front/types/command.types';

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
	clientStateBuffer: Array<{ tick: number; game: IGame }>;
	inputBuffer: Array<Commands[]>;
	lastServerState: IServerState;
	lastProcessedServerState: IServerState;
	tickAdjustment: number;
	adjustmentIteration: number;
	serverAdjustmentIteration: number;
	inputQueue: Commands[];
	skipPieceGeneration: number;
	indestructibleQueue: IIndestructiblePacket[];
	gravity: number;
	gameMode: GameMode;
	countdown: number;
	forceReconcileTimer: number;
	render: boolean;
}

export const defaultGameState: IGameState = {
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
	clientStateBuffer: new Array<{ tick: number; game: IGame }>(BUFFER_SIZE),
	lastServerState: null,
	lastProcessedServerState: null,
	tickAdjustment: 0,
	adjustmentIteration: 0,
	serverAdjustmentIteration: 0,
	inputQueue: [],
	inputBuffer: new Array<Commands[]>(BUFFER_SIZE),
	indestructibleQueue: [],
	gravity: 0.04,
	gameMode: GameMode.SOLO,
	countdown: 3,

	skipPieceGeneration: 0,
	forceReconcileTimer: performance.now(),
	render: true,
};

export const gameSlice = createSlice({
	name: 'game',
	initialState: defaultGameState,
	reducers: {
		leaveGame: () => {},
		addInputToQueue(state, action) {
			if (state.tick >= 90) {
				state.inputQueue.push(action.payload);
			}
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
			state.adjustmentIteration = 0;
			state.serverAdjustmentIteration = 0;
			state.lastProcessedServerState = null;
			state.lastServerState = null;
			state.inputQueue = [];
			state.indestructibleQueue = [];
			state.countdown = 3;
			state.clientStateBuffer = new Array<{ tick: number; game: IGame }>(
				BUFFER_SIZE
			);
			state.inputBuffer = new Array<Commands[]>(BUFFER_SIZE);
			state.tick = 0;
			state.timer = 0;
			state.tickAdjustment = 0;
			state.tickToMoveDown = 0;
			state.gravity = 0.04;
			state.playerGame = action.payload.playerGame;
			state.gameMode = action.payload.gameMode;
			if (state.gameMode === GameMode.BATTLEROYAL) {
				state.opponentsGames = action.payload.opponentsGames;
			}
			//TODO not store seed?
			state.seed = action.payload.seed;
			state.rng = seedrandom(state.seed);
			generatePieces(state, 4);
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
		updateGamesBoard: (
			state,
			action: { payload: IGameUpdatePacketHeader }
		) => {
			const packetWhithHeader = action.payload;
			const gamePackets = packetWhithHeader.gamePackets;
			if (state.gameStarted === false) {
				return;
			}

			if (
				state.serverAdjustmentIteration !=
				packetWhithHeader.adjustmentIteration
			) {
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
					index !== -1 &&
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
				state.timer += state.tickAdjustment * MIN_TIME_BETWEEN_TICKS;
				// console.log('adjusting tick: ', state.tickAdjustment);
				// const tickToCatchUp = state.tick + state.tickAdjustment;
				// while (state.tick < tickToCatchUp) {
				// 	softDrop(state);
				// 	state.clientStateBuffer[state.tick % BUFFER_SIZE] = {
				// 		tick: state.tick,
				// 		game: cloneDeep(state.playerGame),
				// 	};
				// 	state.tick++;
				// }
			}

			// server reconciliation
			if (
				state.lastProcessedServerState?.tick !==
				state.lastServerState?.tick
			) {
				handleServerReconciliation(state);
			}

			// countdown before game starts + sync with server
			if (state.tick < 90) {
				if (state.tick % 30 === 0) {
					state.countdown = 3 - state.tick / 30;
				}
				while (state.timer >= MIN_TIME_BETWEEN_TICKS) {
					const instance = SocketFactory.Instance();
					const data = {
						tick: state.tick,
						adjustmentIteration: state.adjustmentIteration,
					};
					// console.log('sync with server', data);
					instance.emit(SocketEvent.SyncWithServer, { data });
					state.tick++;
					state.timer -= MIN_TIME_BETWEEN_TICKS;
				}
				return;
			} else if (state.countdown !== -1) {
				state.countdown = -1;
			}
			//------------------------------------------------------------------
			const now = performance.now();
			while (state.timer >= MIN_TIME_BETWEEN_TICKS) {
				// if (state.tick === 500) {
				// 	state.playerGame.gameOver = true;
				// 	// 	console.log('force reconcile');
				// 	// 	hardDrop(state);
				// 	// 	state.forceReconcileTimer = now;
				// 	// 	state.render = false;
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
					// console.log(
					// 	'tick: ',
					// 	state.tick,
					// 	'input processed: ',
					// 	state.inputQueue.length
					// );
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
					// if (state.tick % 100 !== 0 || state.tick % 150 === 0) {
					instance.emit(SocketEvent.CommandPressed, {
						data: data,
					});
					// }
					state.inputQueue.length = 0;
				}
				softDrop(state);
				state.clientStateBuffer[state.tick % BUFFER_SIZE] = {
					tick: state.tick,
					game: cloneDeep(state.playerGame),
				};
				// state.clientStateBuffer[state.tick % BUFFER_SIZE] = {
				// 	...state.playerGame,
				// };

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
	updatePlayerGame,
	addInputToQueue,
	updateIndestructibleLines,
	updateTickAdjustments,
	resetGame,
	leaveGame,
	gameOver,
} = gameSlice.actions;

export default gameSlice.reducer;
