import { CellType } from './cell.interface';

export interface ITetromino {
	type: CellType;
	position: IPosition;
}

export interface IPosition {
	x: number;
	y: number;
}

export const I_TetrominoShape = [
	[
		[0, 0, 0, 0],
		[1, 1, 1, 1],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
	],
	[
		[0, 0, 1, 0],
		[0, 0, 1, 0],
		[0, 0, 1, 0],
		[0, 0, 1, 0],
	],
	[
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[1, 1, 1, 1],
		[0, 0, 0, 0],
	],
	[
		[0, 1, 0, 0],
		[0, 1, 0, 0],
		[0, 1, 0, 0],
		[0, 1, 0, 0],
	],
];

export const J_TetrominoShape = [
	[
		[1, 0, 0],
		[1, 1, 1],
		[0, 0, 0],
	],
	[
		[0, 1, 1],
		[0, 1, 0],
		[0, 1, 0],
	],
	[
		[0, 0, 0],
		[1, 1, 1],
		[0, 0, 1],
	],
	[
		[0, 1, 0],
		[0, 1, 0],
		[1, 1, 0],
	],
];

export const L_TetrominoShape = [
	[
		[0, 0, 1],
		[1, 1, 1],
		[0, 0, 0],
	],
	[
		[0, 1, 0],
		[0, 1, 0],
		[0, 1, 1],
	],
	[
		[0, 0, 0],
		[1, 1, 1],
		[1, 0, 0],
	],
	[
		[1, 1, 0],
		[0, 1, 0],
		[0, 1, 0],
	],
];

export const O_TetrominoShape = [
	[1, 1],
	[1, 1],
];
export const S_TetrominoShape = [
	[
		[0, 1, 1],
		[1, 1, 0],
		[0, 0, 0],
	],
	[
		[0, 1, 0],
		[0, 1, 1],
		[0, 0, 1],
	],
	[
		[0, 0, 0],
		[0, 1, 1],
		[1, 1, 0],
	],
	[
		[1, 0, 0],
		[1, 1, 0],
		[0, 1, 0],
	],
];

export const T_TetrominoShape = [
	[
		[0, 1, 0],
		[1, 1, 1],
		[0, 0, 0],
	],
	[
		[0, 1, 0],
		[0, 1, 1],
		[0, 1, 0],
	],
	[
		[0, 0, 0],
		[1, 1, 1],
		[0, 1, 0],
	],
	[
		[0, 1, 0],
		[1, 1, 0],
		[0, 1, 0],
	],
];

export const Z_TetrominoShape = [
	[
		[1, 1, 0],
		[0, 1, 1],
		[0, 0, 0],
	],
	[
		[0, 0, 1],
		[0, 1, 1],
		[0, 1, 0],
	],
	[
		[0, 0, 0],
		[1, 1, 0],
		[0, 1, 1],
	],
	[
		[0, 1, 0],
		[1, 1, 0],
		[1, 0, 0],
	],
];

export const TetriminosArray: Array<ITetromino> = [
	{
		type: CellType.I,
		position: { x: 3, y: -1 },
	},
	{
		type: CellType.J,
		position: { x: 3, y: 0 },
	},
	{
		type: CellType.L,
		position: { x: 3, y: 0 },
	},
	{
		type: CellType.O,
		position: { x: 4, y: 0 },
	},
	{
		type: CellType.S,
		position: { x: 3, y: 0 },
	},
	{
		type: CellType.T,
		position: { x: 3, y: 0 },
	},
	{
		type: CellType.Z,
		position: { x: 3, y: 0 },
	},
];
// Super Rotation System
export const JLTSZ_SRS = [
	// State 0
	[
		{ x: 0, y: 0 },
		{ x: -1, y: 0 },
		{ x: -1, y: -1 },
		{ x: 0, y: 2 },
		{ x: -1, y: 2 },
	],
	// State 1
	[
		{ x: 0, y: 0 },
		{ x: 1, y: 0 },
		{ x: 1, y: 1 },
		{ x: 0, y: -2 },
		{ x: 1, y: -2 },
	],
	// State 2
	[
		{ x: 0, y: 0 },
		{ x: 1, y: 0 },
		{ x: 1, y: -1 },
		{ x: 0, y: 2 },
		{ x: 1, y: 2 },
	],
	// State 3
	[
		{ x: 0, y: 0 },
		{ x: -1, y: 0 },
		{ x: -1, y: 1 },
		{ x: 0, y: -2 },
		{ x: -1, y: -2 },
	],
];

export const I_SRS = [
	// State 0
	[
		{ x: 0, y: 0 },
		{ x: -1, y: 0 },
		{ x: 2, y: 0 },
		{ x: -1, y: -2 },
		{ x: 2, y: 1 },
	],
	// State 1
	[
		{ x: 0, y: 0 },
		{ x: 2, y: 0 },
		{ x: -1, y: 0 },
		{ x: 2, y: -1 },
		{ x: -1, y: 2 },
	],
	// State 2
	[
		{ x: 0, y: 0 },
		{ x: 1, y: 0 },
		{ x: -2, y: 0 },
		{ x: 1, y: 2 },
		{ x: -2, y: -1 },
	],
	// State 3
	[
		{ x: 0, y: 0 },
		{ x: -2, y: 0 },
		{ x: 1, y: 0 },
		{ x: -2, y: 1 },
		{ x: 1, y: -2 },
	],
];
