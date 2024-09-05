import { IBoard, defaultCell } from 'front/types/board.types';

export const buildBoard = ({ rows, columns, boardCells = defaultCell }): IBoard => {
	const builtRows = Array.from({ length: rows }, () =>
		Array.from({ length: columns }, () => ({ ...boardCells }))
	);
	return {
		cells: builtRows,
		size: { rows, columns },
	};
};
