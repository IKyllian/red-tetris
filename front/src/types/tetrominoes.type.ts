const className = "tetromino";

export interface ITetromino {
  shape: number[][];
  className: string;
}

export interface IPosition {
  x: number;
  y: number;
}

export const defaultPosition: IPosition = {
  x: 3,
  y: 0,
};

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
