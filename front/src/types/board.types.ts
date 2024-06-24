import { IPlayer } from 'front/types/player.type';
import { CellType, ITetromino } from 'front/types/tetrominoes.type';

export interface ICell {
	occupied: boolean;
	type: CellType;
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
	// gameOver: boolean;
}

export const defaultCell: ICell = {
	occupied: false,
	type: CellType.EMPTY,
	isPreview: false,
};

export interface IGame {
	board: IBoard;
	player: IPlayer;
	score: number;
	piece: ITetromino;
	gameOver: boolean;
	level: number;
	linesCleared: number;
	totalLinesCleared: number;
	currentPieceIndex: number;
	tickToMoveDown: number;
}

export const defaultGame: IGame = {
	board: {
		cells: Array.from({ length: defaultBoardSize.rows }, () =>
			Array.from({ length: defaultBoardSize.columns }, () => defaultCell)
		),
		size: defaultBoardSize,
		// gameOver: false,
	},
	player: {
		id: '',
		name: '',
		isLeader: false,
	},
	score: 0,
	piece: null,
	gameOver: false,
	level: 0,
	linesCleared: 0,
	totalLinesCleared: 0,
	currentPieceIndex: 0,
	tickToMoveDown: 0,
};

export const NbOfLinesForNextLevel = 1;

export const Scoring = [100, 300, 500, 800];
