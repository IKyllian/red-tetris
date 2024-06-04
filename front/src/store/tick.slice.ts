import { createSlice } from '@reduxjs/toolkit';
import {
	IGameUpdatePacket,
	IGameUpdatePacketHeader,
	IPositionUpdate,
	IServerState,
	UpdateType,
} from 'front/types/packet.types';
import { IGame } from 'front/types/board.types';
import {
	getShape,
	clearOldPosition,
	transferPieceToBoard,
} from 'front/utils/piece.utils';
interface ITick {
	tick: number;
	lastUpdate: number | undefined;
	gameInterval: number;
	tickToMoveDown: number;
	tickAdjustment: number;
	adjustmentIteration: number;
	lastServerState: IServerState | undefined;
	gamesState: IGame[];
}

const defaultTickState: ITick = {
	tick: 0,
	lastUpdate: undefined,
	gameInterval: 0,
	tickToMoveDown: 0,
	tickAdjustment: 0,
	adjustmentIteration: 0,
	lastServerState: undefined,
	gamesState: [],
};

export const tickSlice = createSlice({
	name: 'tick',
	initialState: defaultTickState,
	reducers: {
		setTickToMoveDown: (state) => {
			state.tickToMoveDown += 1;
		},
		setTick: (state) => {
			state.tick += 1;
		},
		initLastUpdate: (state) => {
			if (state.lastUpdate === undefined) {
				state.lastUpdate = performance.now();
			}
		},
		setGamesState: (_, action) => action.payload,
		setLastUpdate: (state, action) => {
			console.log('setLastUpdate = ', action.payload);
			state.lastUpdate = action.payload;
			console.log('STATE = ', state.lastUpdate);
		},
		setGameInterval: (state, action) => {
			state.gameInterval = action.payload;
		},
		setTickAdjustments: (
			state,
			action: {
				payload: { packet: IGameUpdatePacketHeader; playerId: string };
			}
		) => {
			const packet = action.payload.packet;
			state.tickAdjustment = packet.tickAdjustment;
			state.adjustmentIteration = packet.adjustmentIteration;
			const lastServerState = packet.gamePackets.find((gamePacket) => {
				return gamePacket.state.player.id === action.payload.playerId;
			});
			if (lastServerState) {
				state.lastServerState = {
					tick: packet.tick,
					packet: lastServerState,
				};
			}
			///
			// const packetWhithHeader = action.payload.packet;
			// const gamePackets = packetWhithHeader.gamePackets;
			// for (const gamePacket of gamePackets) {
			// 	if (gamePacket.state.player.id === action.payload.playerId) {
			// 		state.lastServerState = {
			// 			tick: packet.tick,
			// 			packet: lastServerState,
			// 		};
			// 		continue;
			// 	}

			// 	const index = state.gamesState.findIndex(
			// 		(g) => g.player.id === gamePacket.state.player.id
			// 	);
			// 	let currentState = state.gamesState[index];
			// 	if (
			// 		currentState &&
			// 		gamePacket.updateType === UpdateType.POSITION
			// 	) {
			// 		const newState = gamePacket.state as IPositionUpdate;
			// 		const piece = currentState.pieces[0];
			// 		let shape = getShape(piece.type, piece.rotationState);
			// 		//why is it working
			// 		clearOldPosition(piece, shape, currentState.board);
			// 		if (piece.rotationState !== newState.piece.rotationState) {
			// 			shape = getShape(
			// 				newState.piece.type,
			// 				newState.piece.rotationState
			// 			);
			// 		}
			// 		transferPieceToBoard(
			// 			currentState.board,
			// 			newState.piece,
			// 			shape,
			// 			false
			// 		);
			// 		currentState.pieces[0] = newState.piece;
			// 	} else if (
			// 		currentState &&
			// 		gamePacket.updateType === UpdateType.GAME
			// 	) {
			// 		const newState = gamePacket.state as IGame;
			// 		currentState = newState;
			// 		state.gamesState[index] = currentState;
			// 	}
			// }
		},
	},
});

export const {
	setTickToMoveDown,
	setTick,
	initLastUpdate,
	setLastUpdate,
	setGameInterval,
	setTickAdjustments,
	setGamesState,
} = tickSlice.actions;

export default tickSlice.reducer;
