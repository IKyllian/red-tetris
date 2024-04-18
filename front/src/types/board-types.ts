export interface ICell {
    occupied: boolean;
    className: string;
    isDestructible: boolean;
}

export interface ISize {
    columns: number;
    rows: number;
}

export interface IBoard {
    cells: ICell[][],
    size: ISize
}

export const defaultCell: ICell = {
    occupied: false,
    className: "",
    isDestructible: true
};