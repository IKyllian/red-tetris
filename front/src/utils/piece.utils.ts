import {
	CellType,
	IPosition,
	ITetromino,
	I_TetrominoShape,
	J_TetrominoShape,
	L_TetrominoShape,
	O_TetrominoShape,
	S_TetrominoShape,
	T_TetrominoShape,
	TetriminosArray,
	Z_TetrominoShape,
} from 'front/types/tetrominoes.type';
import { IBoard, ICell, defaultCell } from 'front/types/board.types';
import seedrandom from 'seedrandom';
import { PIECES_BUFFER_SIZE } from './game.utils';
import { getDropPosition } from 'front/utils/drop.utils';

export function getTetrominoClassName(
	type: CellType,
	preview: boolean = false
) {
	let className = 'tetromino tetromino_';
	const previewClass = preview ? ' drop-preview' : '';
	switch (type) {
		case CellType.I:
			return className + 'I' + previewClass;
		case CellType.J:
			return className + 'J' + previewClass;
		case CellType.L:
			return className + 'L' + previewClass;
		case CellType.O:
			return className + 'O' + previewClass;
		case CellType.S:
			return className + 'S' + previewClass;
		case CellType.T:
			return className + 'T' + previewClass;
		case CellType.Z:
			return className + 'Z' + previewClass;
		case CellType.INDESTRUCTIBLE:
			return className + 'indestructible';
		default:
			return '';
	}
}

export function getShape(type: CellType, rotationState: number): number[][] {
	switch (type) {
		case CellType.I:
			return I_TetrominoShape[rotationState] || I_TetrominoShape[0];
		case CellType.J:
			return J_TetrominoShape[rotationState] || J_TetrominoShape[0];
		case CellType.L:
			return L_TetrominoShape[rotationState] || L_TetrominoShape[0];
		case CellType.O:
			return O_TetrominoShape;
		case CellType.S:
			return S_TetrominoShape[rotationState] || S_TetrominoShape[0];
		case CellType.T:
			return T_TetrominoShape[rotationState] || T_TetrominoShape[0];
		default:
			return Z_TetrominoShape[rotationState] || Z_TetrominoShape[0];
	}
}

export function getPosRight(position: IPosition): IPosition {
	return { ...position, x: position.x + 1 };
}

export function getPosLeft(position: IPosition): IPosition {
	return { ...position, x: position.x - 1 };
}

export function getPosDown(position: IPosition): IPosition {
	return { ...position, y: position.y + 1 };
}

export function getNextPiece(rng: seedrandom.PRNG): ITetromino {
	const index = Math.floor(rng() * TetriminosArray.length);
	const piece = TetriminosArray[index] ? { ...TetriminosArray[index] } : { ...TetriminosArray[0] };
	return piece;
}

export function checkCollision(
	board: IBoard,
	position: IPosition,
	shape: number[][]
): boolean {
	for (let y = 0; y < shape.length; y++) {
		if (position.y + y < 0) continue;

		for (let x = 0; x < shape[y].length; x++) {
			if (shape[y][x]) {
				const _x = x + position.x;
				const _y = y + position.y;

				if (
					_x < 0 ||
					_x >= board.size.columns ||
					_y >= board.size.rows ||
					board.cells[_y][_x].occupied
				) {
					return true;
				}
			}
		}
	}
	return false;
}

export function clearOldPosition(
	tetromino: ITetromino,
	shape: number[][],
	board: IBoard
): ICell[][] {
	let cells = board.cells;
	shape.forEach((row: number[], y: number) => {
		if (tetromino.position.y + y < 0) return;
		row.forEach((cell: number, x: number) => {
			if (cell) {
				const _x = x + tetromino.position.x;
				const _y = y + tetromino.position.y;
				cells[_y][_x] = { ...defaultCell };
			}
		});
	});
	return cells;
}

export function transferPieceToBoard(
	board: IBoard,
	tetromino: ITetromino,
	shape: number[][],
	fixOnBoard: boolean
): ICell[][] {
	let newCells = [...board.cells];
	shape.forEach((row: number[], y: number) => {
		if (tetromino.position.y + y < 0) return;
		row.forEach((cell: number, x: number) => {
			if (cell) {
				const _x = x + tetromino.position.x;
				const _y = y + tetromino.position.y;
				// if (newCells[_y][_x].occupied) {
				// 	board.gameOver = true;
				// }
				newCells[_y][_x] = {
					type: tetromino.type,
					occupied: fixOnBoard,
					isPreview: false,
				};
			}
		});
	});
	return newCells;
}

export function transferPreviewToBoard(
	board: IBoard,
	tetromino: ITetromino,
	shape: number[][]
): ICell[][] {
	let newCells = [...board.cells];
	shape.forEach((row: number[], y: number) => {
		if (tetromino.position.y + y < 0) return;
		row.forEach((cell: number, x: number) => {
			if (cell) {
				const _x = x + tetromino.position.x;
				const _y = y + tetromino.position.y;
				if (newCells[_y][_x].type === CellType.EMPTY) {
					newCells[_y][_x] = {
						type: tetromino.type,
						occupied: false,
						isPreview: true,
					};
				}
			}
		});
	});
	return newCells;
}

export function clearOldDropPosition(
	position: IPosition,
	shape: number[][],
	board: IBoard
): ICell[][] {
	let cells = board.cells;
	shape.forEach((row: number[], y: number) => {
		if (position.y + y < 0) return;
		row.forEach((cell: number, x: number) => {
			const _x = x + position.x;
			const _y = y + position.y;
			if (cell && cells[_y][_x].isPreview) {
				cells[_y][_x] = { ...defaultCell };
			}
		});
	});
	return cells;
}


export function clearDropPreview(
	board: IBoard,
	shape: number[][],
	piece: ITetromino
): void {
	const dropPosition = getDropPosition(board, piece.position, shape);
	clearOldDropPosition(dropPosition, shape, board);
}

export function setDropPreview(
	board: IBoard,
	shape: number[][],
	piece: ITetromino
): void {
	const dropPosition = getDropPosition(board, piece.position, shape);
	board.cells = transferPreviewToBoard(
		board,
		{ ...piece, position: dropPosition },
		shape
	);
}

export function getPieceIndex(currentPieceIndex: number): number {
	return currentPieceIndex % PIECES_BUFFER_SIZE;
}
