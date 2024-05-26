import _, { get, set } from 'lodash';
import {
	CellType,
	IPosition,
	ITetromino,
	I_SRS,
	JLTSZ_SRS,
} from '../types/tetrominoes.type';
import { IBoard, IGame, NbOfLinesForNextLevel } from '../types/board.types';
import { COMMANDS } from '../types/command.types';
import seedrandom from 'seedrandom';
import {
	checkCollision,
	// clearDropPreview,
	clearOldPosition,
	generatePieces,
	getNextPiece,
	getPieceIndex,
	getPosLeft,
	getPosRight,
	getShape,
	// setDropPreview,
	transferPieceToBoard,
} from './piece.utils';
import { checkForLines } from './board.utils';
import { IGameState } from '../store/game.slice';

export function moveDown(state: IGameState): void {
	let tetromino =
		state.pieces[getPieceIndex(state.playerGame.currentPieceIndex)];
	const newPosition = {
		...tetromino.position,
		y: tetromino.position.y + 1,
	};
	state.tickToMoveDown = 0;

	const shape = getShape(tetromino.type, tetromino.rotationState);
	// clearDropPreview(game.board, tetromino, shape);
	if (checkCollision(state.playerGame.board, newPosition, shape)) {
		state.playerGame.board.cells = transferPieceToBoard(
			state.playerGame.board,
			tetromino,
			shape,
			true
		);
		generatePieces(state, 1, 4);
		state.playerGame.currentPieceIndex++;
		// if (state.playerGame.currentPieceIndex + 3 >= state.pieces.length) {
		// 	state.pieces.push(getNextPiece(state.rng));
		// }
		tetromino =
			state.pieces[getPieceIndex(state.playerGame.currentPieceIndex)];
		const newShape = getShape(tetromino.type, tetromino.rotationState);
		const linesCleared = checkForLines(state.playerGame.board);
		if (linesCleared > 0) {
			state.playerGame.linesCleared += linesCleared;
			if (state.playerGame.linesCleared >= NbOfLinesForNextLevel) {
				state.playerGame.linesCleared -= NbOfLinesForNextLevel; //TODO Not sure
				state.playerGame.level++;
				state.playerGame.linesCleared = 0;
			}
			state.playerGame.totalLinesCleared += linesCleared;
		}
		// setDropPreview(game.board, tetromino, newShape);
		state.playerGame.board.cells = transferPieceToBoard(
			state.playerGame.board,
			tetromino,
			newShape,
			false
		);
	} else {
		clearOldPosition(tetromino, shape, state.playerGame.board);
		// setDropPreview(state.playerGame.board, tetromino, shape);
		tetromino.position = newPosition;
		state.playerGame.board.cells = transferPieceToBoard(
			state.playerGame.board,
			tetromino,
			shape,
			false
		);
	}
}

export function hardDrop(state): void {
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
	const tetromino =
		state.pieces[getPieceIndex(state.playerGame.currentPieceIndex)];
	const board = state.playerGame.board;
	const newPos = cb(tetromino.position);
	const shape = getShape(tetromino.type, tetromino.rotationState);

	if (!checkCollision(board, newPos, shape)) {
		// clearDropPreview(board, tetromino, shape);
		clearOldPosition(tetromino, shape, board);
		tetromino.position = newPos;
		// setDropPreview(board, tetromino, shape);
		board.cells = transferPieceToBoard(board, tetromino, shape, false);
	}
}

export function rotate(state): void {
	const piece =
		state.pieces[getPieceIndex(state.playerGame.currentPieceIndex)];
	const board = state.playerGame.board;
	if (piece.type === CellType.O) return;
	const currentShape = getShape(piece.type, piece.rotationState);
	const newRotation = (piece.rotationState + 1) % 4;
	const newShape = getShape(piece.type, newRotation);
	const srs = piece.type === CellType.I ? I_SRS : JLTSZ_SRS;
	for (let position of srs[piece.rotationState]) {
		const newPosition = {
			x: piece.position.x + position.x,
			y: piece.position.y + position.y,
		};
		if (!checkCollision(board, newPosition, newShape)) {
			// clearDropPreview(board, piece, currentShape);
			clearOldPosition(piece, currentShape, board);
			piece.position = newPosition;
			piece.rotationState = newRotation;
			// setDropPreview(board, piece, newShape);
			board.cells = transferPieceToBoard(board, piece, newShape, false);
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
