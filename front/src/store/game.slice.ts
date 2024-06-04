import { createSlice } from '@reduxjs/toolkit';
import { IGame, defaultGame } from 'front/types/board.types';
import {
	IGameUpdatePacket,
	IGameUpdatePacketHeader,
	IInputsPacket,
	IPositionUpdate,
	IServerState,
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

export const PIECES_BUFFER_SIZE = 100;
const MIN_TIME_BETWEEN_TICKS = 1000 / 30;
const BUFFER_SIZE = 1024;
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
	pendingInputs: IInputsPacket; //TODO delete
	skipPieceGeneration: number;

	forceReconcileTimer: number;
	render: boolean;
}

const defaultGameState: IGameState = {
	seed: '',
	gameStarted: false,
	// playerGame: defaultGame,
	playerGame: null,
	opponentsGames: [],
	opponentsUpdates: [],
	leaderboard: [],
	gamesOver: false,
	pieces: new Array<ITetromino>(PIECES_BUFFER_SIZE),
	// pieceIndex: 0,
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
	pendingInputs: null,

	skipPieceGeneration: 0,
	forceReconcileTimer: performance.now(),
	render: true,
};

export const gameSlice = createSlice({
	name: 'game',
	initialState: defaultGameState,
	reducers: {
		sendInputs: (state, __) => {
			console.log('okok input sent');
			state.pendingInputs = null;
		},
		addInputToQueue(state, action) {
			state.inputQueue.push(action.payload);
		},

		setGameStartingState: (
			state,
			action: {
				payload: {
					playerGame: IGame;
					opponentsGames: IGame[];
					seed: string;
				};
			}
		) => {
			state.playerGame = action.payload.playerGame;
			state.opponentsGames = action.payload.opponentsGames;
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
			// console.log('nb of update = ', action.payload.gamePackets.length);
			const packetWhithHeader = action.payload;
			const gamePackets = packetWhithHeader.gamePackets;
			//TODO check if rendered once every update
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
			// const playerIndex = gamePackets.findIndex(
			// 	(g) => g.state.player.id === state.playerGame.player.id
			// );
			// if (playerIndex !== -1) {
			// 	state.lastServerState = {
			// 		tick: packetWhithHeader.tick,
			// 		packet: gamePackets[playerIndex],
			// 	};
			// 	gamePackets.splice(playerIndex, 1);
			// }
			// state.opponentsUpdates = gamePackets;

			//-------------------------------------------------------------------

			for (const gamePacket of gamePackets) {
				if (gamePacket.state.player.id === state.playerGame.player.id) {
					// console.log('player updates');
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
					state.opponentsGames[index] &&
					gamePacket.updateType === UpdateType.POSITION
				) {
					console.log("POSITION")
					const newState = gamePacket.state as IPositionUpdate;
					const piece = state.opponentsGames[index].piece;
					let shape = getShape(piece.type, piece.rotationState);
					//why is it working
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
			// state.render = false;
			state.timer += action.payload;

			if (state.adjustmentIteration != state.serverAdjustmentIteration) {
				state.adjustmentIteration = state.serverAdjustmentIteration;
				state.timer += MIN_TIME_BETWEEN_TICKS * state.tickAdjustment;
				state.inputQueue.length = 0;
				console.log('adjusting tick');
			}

			// server reconciliation
			if (state.lastProcessedServerState !== state.lastServerState) {
				const index = state.lastServerState.tick % BUFFER_SIZE;
				if (state.clientStateBuffer[index]) {
					const serverGameState = state.lastServerState.packet
						.state as IGame;
					if (
						!compareCells(
							state.clientStateBuffer[index].board.cells,
							serverGameState.board.cells,
							state.clientStateBuffer[index].piece
						) ||
						serverGameState.gameOver ||
						!isEqual(
							state.clientStateBuffer[index].piece,
							serverGameState.piece
						)
					) {
						if (
							!compareCells(
								state.clientStateBuffer[index].board.cells,
								serverGameState.board.cells,
								state.clientStateBuffer[index].piece
							)
						) {
							console.log('board different');
						}
						if (serverGameState.gameOver) {
							console.log('game over from server update');
						}
						if (
							!isEqual(
								state.clientStateBuffer[index].piece,
								serverGameState.piece
							)
						) {
							console.log('piece different');
						}
						console.log(
							'-----------------------------------------------------'
						);

						state.clientStateBuffer[index] = { ...serverGameState };
						state.tickToMoveDown = serverGameState.tickToMoveDown;
						let tickToProcess = state.lastServerState.tick + 1;
						const pieceDiff =
							serverGameState.currentPieceIndex -
							state.playerGame.currentPieceIndex;
						if (pieceDiff >= 0) {
							generatePieces(state, pieceDiff, 4);
						} else {
							state.skipPieceGeneration += pieceDiff * -1;
						}
						state.playerGame = { ...serverGameState };
						while (tickToProcess < state.tick) {
							const index = tickToProcess % BUFFER_SIZE;
							if (state.inputBuffer[index]?.length > 0) {
								//TODO problem here
								console.log('reprocess inputs');
								state.inputBuffer[index].forEach((input) => {
									console.log('input', input);
									handleInput(input, state);
								});
							}
							if (
								state.tickToMoveDown >=
								getFramesPerGridCell(state.playerGame.level)
							) {
								moveDown(state);
							} else {
								state.tickToMoveDown++;
							}
							state.clientStateBuffer[
								tickToProcess % BUFFER_SIZE
							] = {
								...state.playerGame,
							};
							tickToProcess++;
						}
						const shape = getShape(
							state.playerGame.piece.type,
							state.playerGame.piece.rotationState
						);
						setDropPreview(
							state.playerGame.board,
							state.playerGame.piece
						);
						transferPieceToBoard(
							state.playerGame.board,
							state.playerGame.piece,
							shape,
							false
						);
					}
					state.lastProcessedServerState = state.lastServerState;
				}
			}
			////--------------------------------------------------------------
			//------------------------------------------------------------------
			const now = performance.now();
			while (state.timer >= MIN_TIME_BETWEEN_TICKS) {
				// if (state.tick === 200) {
				// 	console.log('force reconcile');
				// 	hardDrop(state);
				// 	state.forceReconcileTimer = now;
				// 	state.render = false;
				// }
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
				if (
					state.tickToMoveDown >=
					getFramesPerGridCell(state.playerGame.level)
				) {
					moveDown(state);
				} else {
					state.tickToMoveDown++;
				}

				state.clientStateBuffer[state.tick % BUFFER_SIZE] = {
					...state.playerGame,
				};

				state.tick++;
				// console.log('one tick');
				state.timer -= MIN_TIME_BETWEEN_TICKS;
			}
		},
		updateIndestructibleLines(state, action) {
			addIndestructibleLines(state, action.payload);
		},
	},
});

export const {
	sendInputs,
	setGameStartingState,
	updateGamesBoard,
	updatePlayerGame,
	addInputToQueue,
	updateIndestructibleLines,
} = gameSlice.actions;

export default gameSlice.reducer;
