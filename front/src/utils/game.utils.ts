import { IGameState } from 'front/store/game.slice';
import { IGame } from 'front/types/board.types';
import { cloneDeep, isEqual } from 'lodash';
import { compareCells, getFramesPerGridCell } from './board.utils';
import { moveDown } from 'front/utils/piece-move.utils';
import { getShape, setDropPreview, transferPieceToBoard } from './piece.utils';
import { generatePieces } from 'front/utils/piece-generation.utils';
import { GameMode } from 'front/types/packet.types';
import { handleInput } from './handle-inputs.utils';

export const PIECES_BUFFER_SIZE = 100;
export const MIN_TIME_BETWEEN_TICKS = 1000 / 30;
export const BUFFER_SIZE = 1024;

export function handleServerReconciliation(state: IGameState) {
	const index = state.lastServerState.tick % BUFFER_SIZE;
	if (
		state.clientStateBuffer[index] &&
		state.clientStateBuffer[index].tick === state.lastServerState.tick
	) {
		const serverGameState = state.lastServerState.packet.state as IGame;
		if (
			!compareCells(
				state.clientStateBuffer[index].game.board.cells,
				serverGameState.board.cells,
				state.clientStateBuffer[index].game.piece
			) ||
			serverGameState.gameOver ||
			!isEqual(
				state.clientStateBuffer[index].game.piece,
				serverGameState.piece
			)
		) {
			// state.clientStateBuffer[index] = { ...serverGameState };
			state.clientStateBuffer[index] = {
				tick: state.lastServerState.tick,
				game: cloneDeep(serverGameState),
			};
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
					state.inputBuffer[index].forEach((input) => {
						handleInput(input, state);
					});
				}
				softDrop(state);
				// state.clientStateBuffer[tickToProcess % BUFFER_SIZE] = {
				// 	...state.playerGame,
				// };
				state.clientStateBuffer[tickToProcess % BUFFER_SIZE] = {
					tick: tickToProcess,
					game: cloneDeep(state.playerGame),
				};
				tickToProcess++;
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
		}
	}
	state.lastProcessedServerState = state.lastServerState;
}

export function softDrop(state: IGameState) {
	switch (state.gameMode) {
		case GameMode.BATTLEROYAL:
			if (state.tickToMoveDown >= 1) {
				moveDown(state, true);
			} else {
				state.tickToMoveDown += state.gravity;
			}
			break;
		default:
			if (
				state.tickToMoveDown >=
				getFramesPerGridCell(state.playerGame.level)
			) {
				moveDown(state, true);
			} else {
				state.tickToMoveDown++;
			}
			break;
	}
}
