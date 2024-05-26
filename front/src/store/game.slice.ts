import { createSlice } from '@reduxjs/toolkit';
import { IGame, defaultGame } from '../types/board.types';
import {
	IGameUpdatePacketHeader,
	IInputsPacket,
	IPositionUpdate,
	IServerState,
	UpdateType,
} from '../types/packet.types';
import {
	getShape,
	clearOldPosition,
	transferPieceToBoard,
	generatePieces,
} from '../utils/piece.utils';
import { ITetromino } from '../types/tetrominoes.type';
import { handleInput, moveDown } from '../utils/handle-inputs.utils';
import seedrandom from 'seedrandom';
import { COMMANDS } from '../types/command.types';
import { getFramesPerGridCell } from '../utils/board.utils';
import SocketFactory from './socketFactory';
import { SocketEvent } from './socketMiddleware';

export const PIECES_BUFFER_SIZE = 100;
const MIN_TIME_BETWEEN_TICKS = 1000 / 30;
const BUFFER_SIZE = 1024;
const TICK_OFFSET = 4;

export interface IGameState {
	seed: string;
	gameStarted: boolean;
	playerGame: IGame;
	opponentsGames: any[];
	leaderboard: any[];
	gamesOver: boolean;
	pieces: ITetromino[];
	// pieceIndex: number;
	tick: number;
	tickToMoveDown: number;
	timer: number;
	rng: seedrandom.PRNG;
	clientStateBuffer: Array<IGame>;
	lastServerState: IServerState;
	lastProcessedServerState: IServerState;
	tickAdjustment: number;
	adjustmentIteration: number;
	serverAdjustmentIteration: number;
	inputQueue: COMMANDS[];
	pendingInputs: IInputsPacket;
}

const defaultGameState: IGameState = {
	seed: '',
	gameStarted: false,
	playerGame: defaultGame,
	opponentsGames: [],
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
	pendingInputs: null,
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
			state.gameStarted = true;
		},
		updateGamesBoard: (
			state,
			action: { payload: IGameUpdatePacketHeader }
		) => {
			// console.log('nb of update = ', action.payload.gamePackets.length);
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
				// let currentState = state.opponentsGames[index];
				let currentState: IGame = state.opponentsGames.find((g) => {
					return g.player.id === gamePacket.state.player.id;
				});
				if (
					currentState &&
					gamePacket.updateType === UpdateType.POSITION
				) {
					const newState = gamePacket.state as IPositionUpdate;
					const piece = currentState.piece;
					let shape = getShape(piece.type, piece.rotationState);
					//why is it working
					clearOldPosition(piece, shape, currentState.board);
					if (piece.rotationState !== newState.piece.rotationState) {
						shape = getShape(
							newState.piece.type,
							newState.piece.rotationState
						);
					}
					transferPieceToBoard(
						currentState.board,
						newState.piece,
						shape,
						false
					);
					currentState.piece = newState.piece;
				} else if (
					currentState &&
					gamePacket.updateType === UpdateType.GAME
				) {
					const newState = gamePacket.state as IGame;
					currentState = newState;
					state.opponentsGames[index] = currentState;
				}
			}
		},
		updatePlayerGame: (state, action) => {
			state.timer += action.payload;

			if (state.adjustmentIteration != state.serverAdjustmentIteration) {
				state.adjustmentIteration = state.serverAdjustmentIteration;
				state.timer += MIN_TIME_BETWEEN_TICKS * state.tickAdjustment;
				state.inputQueue.length = 0;
				console.log('adjusting tick');
			}
			while (state.timer >= MIN_TIME_BETWEEN_TICKS) {
				if (state.inputQueue.length > 0) {
					console.log('sending');
					state.inputQueue.forEach((input) => {
						handleInput(input, state);
					});

					const instance = SocketFactory.Instance();

					//TODO cant i just emit pls ?
					// state.pendingInputs = {
					// 	tick: state.tick,
					// 	adjustmentIteration: state.adjustmentIteration,
					// 	inputs: [...state.inputQueue],
					// };
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
					//Tick to move down with modulo?
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
	},
});

export const {
	sendInputs,
	setGameStartingState,
	updateGamesBoard,
	updatePlayerGame,
	addInputToQueue,
} = gameSlice.actions;

export default gameSlice.reducer;
