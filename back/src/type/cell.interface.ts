export interface ICell {
	occupied: boolean;
	className: string;
	isDestructible: boolean;
}

export const defaultCell: ICell = {
	occupied: false,
	className: '',
	isDestructible: true,
};

export interface ISize {
	columns: number;
	rows: number;
}
