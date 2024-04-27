export interface ITetromino {
	shape: number[][];
	className: string;
	position: IPosition;
}

export interface IPosition {
	x: number;
	y: number;
}

const className = 'tetromino';

export enum TetrominoType {
	I = `tetromino tetromino_I`,
	J = `tetromino tetromino_J`,
	L = `tetromino tetromino_L`,
	O = `tetromino tetromino_O`,
	S = `tetromino tetromino_S`,
	T = `tetromino tetromino_T`,
	Z = `tetromino tetromino_Z`,
}

export const indestructibleCell = `${className} ${className}_indestructible`;

export const TetriminosArray: Array<ITetromino> = [
	{
		shape: [
			[0, 0, 0, 0],
			[1, 1, 1, 1],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
		],
		className: TetrominoType.I,
		position: { x: 3, y: -1 },
	},
	{
		shape: [
			[1, 0, 0],
			[1, 1, 1],
			[0, 0, 0],
		],
		className: TetrominoType.J,
		position: { x: 3, y: 0 },
	},
	{
		shape: [
			[0, 0, 1],
			[1, 1, 1],
			[0, 0, 0],
		],
		className: TetrominoType.L,
		position: { x: 3, y: 0 },
	},
	{
		shape: [
			[1, 1],
			[1, 1],
		],
		className: TetrominoType.O,
		position: { x: 4, y: 0 },
	},
	{
		shape: [
			[0, 1, 1],
			[1, 1, 0],
			[0, 0, 0],
		],
		className: TetrominoType.S,
		position: { x: 3, y: 0 },
	},
	{
		shape: [
			[0, 1, 0],
			[1, 1, 1],
			[0, 0, 0],
		],
		className: TetrominoType.T,
		position: { x: 3, y: 0 },
	},
	{
		shape: [
			[1, 1, 0],
			[0, 1, 1],
			[0, 0, 0],
		],
		className: TetrominoType.Z,
		position: { x: 3, y: 0 },
	},
];
