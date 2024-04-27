export interface ITetromino {
	shape: number[][];
	className: string;
	position: IPosition;
}

export interface IPosition {
	x: number;
	y: number;
}

export const defaultPosition: IPosition = {
	x: 3,
	y: 0,
};

const className = 'tetromino';

export const indestructibleCell = `${className} ${className}_indestructible`;

export const TetriminosArray: Array<ITetromino> = [
	{
		shape: [
			[0, 0, 0, 0],
			[1, 1, 1, 1],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
		],
		className: `${className} ${className}_I`,
		position: { x: 3, y: -1 },
	},
	{
		shape: [
			[1, 0, 0],
			[1, 1, 1],
			[0, 0, 0],
		],
		className: `${className} ${className}_J`,
		position: { x: 3, y: 0 },
	},
	{
		shape: [
			[0, 0, 1],
			[1, 1, 1],
			[0, 0, 0],
		],
		className: `${className} ${className}_L`,
		position: { x: 3, y: 0 },
	},
	{
		shape: [
			[1, 1],
			[1, 1],
		],
		className: `${className} ${className}_O`,
		position: { x: 4, y: 0 },
	},
	{
		shape: [
			[0, 1, 1],
			[1, 1, 0],
			[0, 0, 0],
		],
		className: `${className} ${className}_S`,
		position: { x: 3, y: 0 },
	},
	{
		shape: [
			[0, 1, 0],
			[1, 1, 1],
			[0, 0, 0],
		],
		className: `${className} ${className}_T`,
		position: { x: 3, y: 0 },
	},
	{
		shape: [
			[1, 1, 0],
			[0, 1, 1],
			[0, 0, 0],
		],
		className: `${className} ${className}_Z`,
		position: { x: 3, y: 0 },
	},
];
