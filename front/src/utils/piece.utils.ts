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
} from '../types/tetrominoes.type';
import { IBoard, ICell, defaultCell } from '../types/board.types';
import seedrandom from 'seedrandom';
import { IGameState, PIECES_BUFFER_SIZE } from '../store/game.slice';

export function getTetrominoClassName(
	type: CellType,
	preview: boolean = false
) {
	let className = 'tetromino tetromino_';
	let previewClass = '';
	if (preview) {
		previewClass = ' drop-preview';
	}
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
			return I_TetrominoShape[rotationState];
		case CellType.J:
			return J_TetrominoShape[rotationState];
		case CellType.L:
			return L_TetrominoShape[rotationState];
		case CellType.O:
			return O_TetrominoShape;
		case CellType.S:
			return S_TetrominoShape[rotationState];
		case CellType.T:
			return T_TetrominoShape[rotationState];
		default:
			return Z_TetrominoShape[rotationState];
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

export function getNextPiece(rng: seedrandom.PRNG) {
	const index = Math.floor(rng() * TetriminosArray.length);
	const piece = { ...TetriminosArray[index] };
	return piece;
}

export function generatePieces(
	state: IGameState,
	count: number,
	offset: number = 0
) {
	const i =
		(state.playerGame.currentPieceIndex % PIECES_BUFFER_SIZE) + offset;
	// console.log('generatePieces', i);
	for (let j = 0; j < count; j++) {
		// console.log('in loop');
		if (state.skipPieceGeneration > 0) {
			state.skipPieceGeneration--;
			continue;
		}
		state.pieces[i + j] = getNextPiece(state.rng);
	}
}

export function checkCollision(
	board: IBoard,
	position: IPosition,
	shape: number[][]
): boolean {
	let isCollision = false;
	shape.forEach((row: number[], y: number) => {
		if (position.y + y < 0) return;
		row.forEach((cell: number, x: number) => {
			if (cell) {
				const _x = x + position.x;
				const _y = y + position.y;
				if (
					_x < 0 ||
					_x >= board.size.columns ||
					_y >= board.size.rows
				) {
					isCollision = true;
				} else if (board.cells[_y][_x].occupied) {
					isCollision = true;
				}
			}
		});
	});
	return isCollision;
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
	fixOnBoard: boolean,
	isPreview: boolean = false
): ICell[][] {
	let newCells = [...board.cells];
	if (isPreview) {
		console.log('isPreview');
	}
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
					isDestructible: true,
					isPreview,
				};
			}
		});
	});
	return newCells;
}

function getDropPosition(
	board: IBoard,
	piece: ITetromino,
	shape: number[][]
): IPosition | null {
	if (checkCollision(board, piece.position, shape)) return null;
	let newPos = piece.position;
	let nextPos = getPosDown(newPos);
	while (!checkCollision(board, nextPos, shape)) {
		newPos = nextPos;
		nextPos = getPosDown(newPos);
	}
	return newPos;
}

export function clearOldDropPosition(
	tetromino: ITetromino,
	shape: number[][],
	board: IBoard
): ICell[][] {
	let cells = board.cells;
	shape.forEach((row: number[], y: number) => {
		if (tetromino.position.y + y < 0) return;
		row.forEach((cell: number, x: number) => {
			const _x = x + tetromino.position.x;
			const _y = y + tetromino.position.y;
			if (cell && cells[_y][_x].isPreview) {
				cells[_y][_x] = { ...defaultCell };
			}
		});
	});
	return cells;
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
						isDestructible: true,
						isPreview: true,
					};
				}
			}
		});
	});
	return newCells;
}

export function clearDropPreview(board: IBoard, piece: ITetromino): void {
	const shape = getShape(piece.type, piece.rotationState);
	const dropPosition = getDropPosition(board, piece, shape);
	if (dropPosition) {
		clearOldDropPosition(
			{ ...piece, position: dropPosition },
			shape,
			board
		);
	}
}

export function setDropPreview(board: IBoard, piece: ITetromino): void {
	const shape = getShape(piece.type, piece.rotationState);
	const dropPosition = getDropPosition(board, piece, shape);
	if (dropPosition) {
		board.cells = transferPreviewToBoard(
			board,
			{ ...piece, position: dropPosition },
			shape
		);
	}
}

export function getPieceIndex(currentPieceIndex: number) {
	return currentPieceIndex % PIECES_BUFFER_SIZE;
}
