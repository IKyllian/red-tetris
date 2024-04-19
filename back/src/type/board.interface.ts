import { ICell, ISize } from './cell.interface';

export interface IBoard {
	cells: ICell[][];
	size: ISize;
}

export const defaultBoardSize: ISize = {
	columns: 10,
	rows: 20,
};
