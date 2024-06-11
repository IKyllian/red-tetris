import _ from 'lodash';
import {
	CellType,
	IPosition,
	I_SRS,
	JLTSZ_SRS,
} from 'front/types/tetrominoes.type';
import { NbOfLinesForNextLevel } from 'front/types/board.types';
import { COMMANDS } from 'front/types/command.types';
import {
	checkCollision,
	clearDropPreview,
	clearOldPosition,
	generatePieces,
	getPieceIndex,
	getPosLeft,
	getPosRight,
	getShape,
	setDropPreview,
	transferPieceToBoard,
} from './piece.utils';
import { checkForLines } from './board.utils';
import { IGameState } from '../store/game.slice';

export function moveDown(state: IGameState): void {
	const newPosition = {
		...state.playerGame.piece.position,
		y: state.playerGame.piece.position.y + 1,
	};
	state.tickToMoveDown = 0;
	// state.tickToMoveDown -= 1;

	const shape = getShape(
		state.playerGame.piece.type,
		state.playerGame.piece.rotationState
	);
	if (checkCollision(state.playerGame.board, newPosition, shape)) {
		state.playerGame.board.cells = transferPieceToBoard(
			state.playerGame.board,
			state.playerGame.piece,
			shape,
			true
		);
		//  Generate one new piece + nbPieceToGenerate,
		//	nbPieceToGenerate can be negative so that in reconciliation we can generate the right amount of pieces
		generatePieces(state, 1, 4);
		state.playerGame.currentPieceIndex++;
		state.playerGame.piece = {
			...state.pieces[getPieceIndex(state.playerGame.currentPieceIndex)],
		};

		state.playerGame.piece =
			state.pieces[getPieceIndex(state.playerGame.currentPieceIndex)];
		const newShape = getShape(
			state.playerGame.piece.type,
			state.playerGame.piece.rotationState
		);
		const linesCleared = checkForLines(state.playerGame.board);

		setDropPreview(
			state.playerGame.board,
			newShape,
			state.playerGame.piece
		);
		if (linesCleared > 0) {
			state.playerGame.linesCleared += linesCleared;
			if (state.playerGame.linesCleared >= NbOfLinesForNextLevel) {
				state.playerGame.linesCleared -= NbOfLinesForNextLevel; //TODO Not sure
				state.playerGame.level++;
				state.playerGame.linesCleared = 0;
			}
			state.playerGame.totalLinesCleared += linesCleared;
		}
		// setDropPreview(game.board, state.playerGame.piece, newShape);
		// TODO client game over
		// if (
		// 	checkCollision(
		// 		state.playerGame.board,
		// 		state.playerGame.piece.position,
		// 		newShape
		// 	)
		// ) {
		// 	state.playerGame.gameOver = true;
		// }
		state.playerGame.board.cells = transferPieceToBoard(
			state.playerGame.board,
			state.playerGame.piece,
			newShape,
			false
		);
	} else {
		clearOldPosition(state.playerGame.piece, shape, state.playerGame.board);
		// setDropPreview(state.playerGame.board, state.playerGame.piece, shape);
		state.playerGame.piece.position = newPosition;
		state.playerGame.board.cells = transferPieceToBoard(
			state.playerGame.board,
			state.playerGame.piece,
			shape,
			false
		);
	}
}

export function hardDrop(state: IGameState): void {
	//TODO get the position of the piece after hard drop and update the board
	const currentPieceIndex = state.playerGame.currentPieceIndex;
	while (currentPieceIndex === state.playerGame.currentPieceIndex) {
		moveDown(state);
	}
}

export function changeStatePiecePosition(
	state: IGameState,
	cb: (position: IPosition) => IPosition
): void {
	// const tetromino = state.playerGame.piece;
	const board = state.playerGame.board;
	const newPos = cb(state.playerGame.piece.position);
	const shape = getShape(
		state.playerGame.piece.type,
		state.playerGame.piece.rotationState
	);

	if (!checkCollision(board, newPos, shape)) {
		clearDropPreview(board, shape, state.playerGame.piece);
		clearOldPosition(state.playerGame.piece, shape, board);
		state.playerGame.piece.position = newPos;
		setDropPreview(board, shape, state.playerGame.piece);
		board.cells = transferPieceToBoard(
			board,
			state.playerGame.piece,
			shape,
			false
		);
	}
}

export function rotate(state: IGameState): void {
	// const piece = state.playerGame.piece;
	const board = state.playerGame.board;
	if (state.playerGame.piece.type === CellType.O) return;
	const currentShape = getShape(
		state.playerGame.piece.type,
		state.playerGame.piece.rotationState
	);
	const newRotation = (state.playerGame.piece.rotationState + 1) % 4;
	const newShape = getShape(state.playerGame.piece.type, newRotation);
	const srs = state.playerGame.piece.type === CellType.I ? I_SRS : JLTSZ_SRS;
	for (let position of srs[state.playerGame.piece.rotationState]) {
		const newPosition = {
			x: state.playerGame.piece.position.x + position.x,
			y: state.playerGame.piece.position.y + position.y,
		};
		if (!checkCollision(board, newPosition, newShape)) {
			clearDropPreview(board, currentShape, state.playerGame.piece);
			clearOldPosition(state.playerGame.piece, currentShape, board);
			state.playerGame.piece.position = newPosition;
			state.playerGame.piece.rotationState = newRotation;
			setDropPreview(board, newShape, state.playerGame.piece);
			board.cells = transferPieceToBoard(
				board,
				state.playerGame.piece,
				newShape,
				false
			);
			break;
		}
	}
}

export function handleInput(input: COMMANDS, state: IGameState): void {
	switch (input) {
		case COMMANDS.KEY_UP:
			rotate(state);
			break;
		case COMMANDS.KEY_DOWN:
			moveDown(state);
			break;
		case COMMANDS.KEY_LEFT:
			changeStatePiecePosition(state, getPosLeft);
			break;
		case COMMANDS.KEY_RIGHT:
			changeStatePiecePosition(state, getPosRight);
			break;
		case COMMANDS.KEY_SPACE:
			hardDrop(state);
			break;
		default:
			break;
	}
}
