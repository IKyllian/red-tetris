export enum CellType {
	I,
	J,
	L,
	O,
	S,
	T,
	Z,
	INDESTRUCTIBLE,
	EMPTY,
}
export interface ICell {
	occupied: boolean;
	type: CellType;
}

export const defaultCell: ICell = {
	occupied: false,
	type: CellType.EMPTY,
};

export interface ISize {
	columns: number;
	rows: number;
}
