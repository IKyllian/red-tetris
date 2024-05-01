
export interface ITetromino {
  shape: number[][];
  className: string;
	position: IPosition;
	rotationState: number;
}

export interface IPosition {
  x: number;
  y: number;
}

export const defaultPosition: IPosition = {
  x: 3,
  y: 0,
};

const className = "tetromino";

export enum TetrominoType {
	I = `${className} tetromino_I`,
	J = `${className} tetromino_J`,
	L = `${className} tetromino_L`,
	O = `${className} tetromino_O`,
	S = `${className} tetromino_S`,
	T = `${className} tetromino_T`,
	Z = `${className} tetromino_Z`,
}

export const indestructibleCell = `${className} ${className}_indestructible`;

export const TETROMINOES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    className: `${className} ${className}_I`,
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    className: `${className} ${className}_J`,
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    className: `${className} ${className}_L`,
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    className: `${className} ${className}_O`,
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    className: `${className} ${className}_S`,
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    className: `${className} ${className}_T`,
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    className: `${className} ${className}_Z`,
  },
};

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