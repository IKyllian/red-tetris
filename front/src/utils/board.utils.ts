import { IBoard, ICell, defaultCell } from '../types/board.types';

export const buildBoard = ({ rows, columns }): IBoard => {
	const builtRows = Array.from({ length: rows }, () =>
		Array.from({ length: columns }, () => ({ ...defaultCell }))
	);

	return {
		cells: builtRows,
		size: { rows, columns },
		gameOver: false,
	};
};

export const getFramesPerGridCell = (level: number): number => {
	let framesPerGridCell = 0;
	if (level <= 9) {
		framesPerGridCell = 48 - level * 5;
	} else if (level <= 12) {
		framesPerGridCell = 5;
	} else if (level <= 15) {
		framesPerGridCell = 4;
	} else if (level <= 18) {
		framesPerGridCell = 3;
	} else if (level <= 28) {
		framesPerGridCell = 2;
	} else {
		framesPerGridCell = 1;
	}
	// framesPerGridCell / 2 because of tick rate
	return framesPerGridCell / 2;
};

export function compareCells(cell1: ICell[][], cell2: ICell[][]): boolean {
	for (let i = 0; i < cell1.length; i++) {
		for (let j = 0; j < cell1[i].length; j++) {
			if (
				cell1[i][j].occupied !== cell2[i][j].occupied ||
				cell1[i][j].type !== cell2[i][j].type ||
				cell1[i][j].isDestructible !== cell2[i][j].isDestructible
			) {
				return false;
			}
		}
	}
	return true;
}

export function checkForLines(board: IBoard): number {
	let lines = 0;
	for (let i = board.size.rows - 1; i >= 0; i--) {
		const row = board.cells[i];
		if (row.every((cell) => cell.occupied && cell.isDestructible)) {
			lines++;
			board.cells.splice(i, 1);
			board.cells.unshift(
				Array.from({ length: board.size.columns }, () => ({
					...defaultCell,
				}))
			);
			++i;
		}
	}
	return lines;
}
