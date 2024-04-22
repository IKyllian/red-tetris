import { IPlayer } from "./player.type";
import { ITetromino } from "./tetrominoes.type";

export interface ICell {
    occupied: boolean;
    className: string;
    isDestructible: boolean;
}

export interface ISize {
    columns: number;
    rows: number;
}

export const defaultBoardSize: ISize = {
    columns: 10,
    rows: 20
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

export interface IGame {
    board: IBoard,
    player: IPlayer,
    score: number,
	pieces: ITetromino[];
	gameOver: boolean;
	level: number;
}