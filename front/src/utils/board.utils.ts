import { IGameState } from '../store/game.slice';
import { IBoard, ICell, defaultCell } from '../types/board.types';
import { CellType } from '../types/tetrominoes.type';

export const buildBoard = ({ rows, columns }): IBoard => {
	const builtRows = Array.from({ length: rows }, () =>
		Array.from({ length: columns }, () => ({ ...defaultCell }))
	);

	return {
		cells: builtRows,
		size: { rows, columns },
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

export function compareCells(
	clientBoard: ICell[][],
	serverBoard: ICell[][]
): boolean {
	for (let i = 0; i < clientBoard.length; i++) {
		for (let j = 0; j < clientBoard[i].length; j++) {
			if (clientBoard[i][j].isPreview) {
				continue;
			}
			if (
				clientBoard[i][j].occupied !== serverBoard[i][j].occupied ||
				clientBoard[i][j].type !== serverBoard[i][j].type ||
				clientBoard[i][j].isDestructible !==
					serverBoard[i][j].isDestructible
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

export function addIndestructibleLines(state: IGameState, nbOfLines: number) {
	const indestructibleRow: ICell[] = Array.from(
		{ length: state.playerGame.board.size.columns },
		() => ({
			occupied: true,
			isDestructible: false,
			type: CellType.INDESTRUCTIBLE,
			isPreview: false,
		})
	);
	console.log('adding indestructible lines');
	for (let i = 0; i < nbOfLines; i++) {
		state.playerGame.board.cells.push(indestructibleRow);
		state.playerGame.board.cells.shift();
		state.playerGame.piece.position.y--;
	}
}
