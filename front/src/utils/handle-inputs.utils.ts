import _, { set } from 'lodash';
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
	getNextPiece,
	getPosLeft,
	getPosRight,
	getShape,
	// setDropPreview,
	transferPieceToBoard,
} from './piece.utils';
import { checkForLines } from './board.utils';

export function moveDown(
	game: IGame,
	tetromino: ITetromino,
	rng: seedrandom.PRNG,
	tickToMoveDown: React.MutableRefObject<number>
): void {
	const newPosition = {
		...tetromino.position,
		y: tetromino.position.y + 1,
	};
	const shape = getShape(tetromino.type, tetromino.rotationState);
	tickToMoveDown.current = 0;
	// clearDropPreview(game.board, tetromino, shape);
	if (checkCollision(game.board, newPosition, shape)) {
		game.board.cells = transferPieceToBoard(
			game.board,
			tetromino,
			shape,
			true
		);
		game.currentPieceIndex++;
		if (game.currentPieceIndex + 3 >= game.pieces.length) {
			game.pieces.push(getNextPiece(rng));
		}
		tetromino = game.pieces[game.currentPieceIndex];
		const newShape = getShape(tetromino.type, tetromino.rotationState);
		const linesCleared = checkForLines(game.board);
		if (linesCleared > 0) {
			game.linesCleared += linesCleared;
			if (game.linesCleared >= NbOfLinesForNextLevel) {
				game.linesCleared -= NbOfLinesForNextLevel; //TODO Not sure
				game.level++;
				game.linesCleared = 0;
			}
			game.totalLinesCleared += linesCleared;
		}
		// setDropPreview(game.board, tetromino, newShape);
		game.board.cells = transferPieceToBoard(
			game.board,
			tetromino,
			newShape,
			false
		);
	} else {
		clearOldPosition(tetromino, shape, game.board);
		// setDropPreview(game.board, tetromino, shape);
		tetromino.position = newPosition;
		game.board.cells = transferPieceToBoard(
			game.board,
			tetromino,
			shape,
			false
		);
	}
}

export function hardDrop(
	game: IGame,
	rng: seedrandom.PRNG,
	tickToMoveDown: React.MutableRefObject<number>
): void {
	//TODO get the position of the piece after hard drop and update the board
	const currentPieceIndex = game.currentPieceIndex;
	while (currentPieceIndex === game.currentPieceIndex) {
		moveDown(
			game,
			game.pieces[game.currentPieceIndex],
			rng,
			tickToMoveDown
		);
	}
}

export function changeStatePiecePosition(
	board: IBoard,
	tetromino: ITetromino,
	cb: (position: IPosition) => IPosition
): void {
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

export function rotate(piece: ITetromino, board: IBoard): void {
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

export function handleInput(
	input: COMMANDS,
	game: IGame,
	rng: seedrandom.PRNG,
	tickToMoveDown: React.MutableRefObject<number>
): void {
	const currentPiece = game.pieces[game.currentPieceIndex];
	switch (input) {
		case COMMANDS.KEY_UP:
			rotate(currentPiece, game.board);
			break;
		case COMMANDS.KEY_DOWN:
			moveDown(game, currentPiece, rng, tickToMoveDown);
			break;
		case COMMANDS.KEY_LEFT:
			changeStatePiecePosition(game.board, currentPiece, getPosLeft);
			break;
		case COMMANDS.KEY_RIGHT:
			changeStatePiecePosition(game.board, currentPiece, getPosRight);
			break;
		case COMMANDS.KEY_SPACE:
			hardDrop(game, rng, tickToMoveDown);
			break;
		default:
			break;
	}
}
