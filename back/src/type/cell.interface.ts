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
	isDestructible: boolean;
}

export const defaultCell: ICell = {
	occupied: false,
	type: CellType.EMPTY,
	isDestructible: true,
};

export interface ISize {
	columns: number;
	rows: number;
}
