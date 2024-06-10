import { IGameState } from 'front/store/game.slice';
import { IGame } from 'front/types/board.types';
import { isEqual } from 'lodash';
import { compareCells, getFramesPerGridCell } from './board.utils';
import { handleInput, moveDown } from './handle-inputs.utils';
import {
	generatePieces,
	getShape,
	setDropPreview,
	transferPieceToBoard,
} from './piece.utils';
import { GameMode } from 'front/types/packet.types';

export const PIECES_BUFFER_SIZE = 100;
export const MIN_TIME_BETWEEN_TICKS = 1000 / 30;
export const BUFFER_SIZE = 1024;

export function handleServerReconciliation(state: IGameState) {
	const index = state.lastServerState.tick % BUFFER_SIZE;
	//TODO check if server tick too late, with buffer size
	if (state.clientStateBuffer[index]) {
		const serverGameState = state.lastServerState.packet.state as IGame;
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
			const clientState = { ...state.clientStateBuffer[index] };
			const serverState = { ...serverGameState };
			console.log('clientState', clientState);
			console.log('serverGameState', serverState);

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
				softDrop(state);
				state.clientStateBuffer[tickToProcess % BUFFER_SIZE] = {
					...state.playerGame,
				};
				tickToProcess++;
			}
			const shape = getShape(
				state.playerGame.piece.type,
				state.playerGame.piece.rotationState
			);
			setDropPreview(state.playerGame.board, state.playerGame.piece);
			transferPieceToBoard(
				state.playerGame.board,
				state.playerGame.piece,
				shape,
				false
			);
		}
	}
	state.lastProcessedServerState = state.lastServerState;
}

export function softDrop(state: IGameState) {
	switch (state.gameMode) {
		case GameMode.BATTLEROYAL:
			if (state.tickToMoveDown >= 1) {
				moveDown(state);
			} else {
				state.tickToMoveDown += state.gravity;
			}
			break;
		default:
			if (
				state.tickToMoveDown >=
				getFramesPerGridCell(state.playerGame.level)
			) {
				moveDown(state);
			} else {
				state.tickToMoveDown++;
			}
			break;
	}
}
