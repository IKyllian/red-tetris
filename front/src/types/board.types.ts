import { IPlayer } from './player.type';
import { CellType, ITetromino } from './tetrominoes.type';

export interface ICell {
	occupied: boolean;
	type: CellType;
	isDestructible: boolean;
	isPreview: boolean;
}

export interface ISize {
	columns: number;
	rows: number;
}

export const defaultBoardSize: ISize = {
	columns: 10,
	rows: 20,
};

export interface IBoard {
	cells: ICell[][];
	size: ISize;
	gameOver: boolean;
}

export const defaultCell: ICell = {
	occupied: false,
	type: CellType.EMPTY,
	isDestructible: true,
	isPreview: false,
};

export interface IGame {
	board: IBoard;
	player: IPlayer;
	score: number;
	pieces: ITetromino[];
	gameOver: boolean;
	level: number;
	linesCleared: number;
	totalLinesCleared: number;
	currentPieceIndex: number;
}

export const defaultGame = {
	board: {
		cells: Array.from({ length: defaultBoardSize.rows }, () =>
			Array.from({ length: defaultBoardSize.columns }, () => defaultCell)
		),
		size: defaultBoardSize,
		gameOver: false,
	},
	player: {
		id: '',
		name: '',
		isLeader: false,
	},
	score: 0,
	pieces: [],
	gameOver: false,
	level: 0,
	linesCleared: 0,
	totalLinesCleared: 0,
	currentPieceIndex: 0,
};

export const NbOfLinesForNextLevel = 10;
