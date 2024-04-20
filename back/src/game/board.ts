import { ICell, ISize, defaultCell } from 'src/type/cell.interface';
import { cloneDeep } from 'lodash';
import { IBoard } from 'src/type/board.interface';
import {
	IPosition,
	ITetromino,
	defaultPosition,
} from 'src/type/tetromino.interface';
import { Piece } from './piece';
interface State {
	tetromino: Piece;
	isOccupied: boolean;
}
export class Board {
	private cells: ICell[][];
	private size: ISize;

	constructor(size: ISize) {
		this.size = size;
		this.cells = this.buildBoard(size);
	}

	private buildBoard = ({ rows, columns }: ISize): ICell[][] => {
		const builtRows = Array.from({ length: rows }, () =>
			Array.from({ length: columns }, () => ({ ...defaultCell }))
		);

		return builtRows;
	};

	public clearOldPosition(tetromino: Piece) {
		tetromino.shape.forEach((row: number[], y: number) => {
			row.forEach((cell: number, x: number) => {
				if (cell) {
					const _x = x + tetromino.position.x;
					const _y = y + tetromino.position.y;
					this.cells[_y][_x] = { ...defaultCell };
				}
			});
		});
	}

	public transferPieceToBoard = ({ tetromino, isOccupied }: State) => {
		// if (!tetromino.isFixed) {
		// 	//clear old pos if not fixed
		// 	this.clearOldPosition(tetromino);
		// }
		tetromino.shape.forEach((row: number[], y: number) => {
			row.forEach((cell: number, x: number) => {
				// console.log(cell)
				if (cell) {
					// cell is 0 or 1
					// console.log("X = ", x, " - Position X = ", position.x," - Y = ", y, " Position Y = ", position.y);
					const occupied = isOccupied;
					const _x = x + tetromino.position.x;
					const _y = y + tetromino.position.y;
					this.cells[_y][_x] = {
						className: tetromino.className,
						occupied,
						isDestructible: true,
					};
				}
			});
		});
	};

	public checkCollision(position: IPosition, tetromino: Piece) {
		let isCollision = false;
		tetromino.shape.forEach((row: number[], y: number) => {
			row.forEach((cell: number, x: number) => {
				if (cell) {
					const _x = x + position.x;
					const _y = y + position.y;
					if (
						_x < 0 ||
						_x >= this.size.columns ||
						_y >= this.size.rows
					) {
						isCollision = true;
					} else if (this.cells[_y][_x].occupied) {
						console.log('Own cell>?');
						isCollision = true;
					}
				}
			});
		});
		return isCollision;
	}

	public moveDown(tetromino: Piece) {
		const newPosition = {
			...tetromino.position,
			y: tetromino.position.y + 1,
		};
		if (this.checkCollision(newPosition, tetromino)) {
			this.transferPieceToBoard({ tetromino, isOccupied: true });
			tetromino.isFixed = true;
		} else {
			this.clearOldPosition(tetromino);
			tetromino.position = newPosition;
			this.transferPieceToBoard({ tetromino, isOccupied: false });
		}
	}

	public moveLeft(tetromino: Piece) {
		const newPosition = {
			...tetromino.position,
			x: tetromino.position.x - 1,
		};
		if (this.checkCollision(newPosition, tetromino)) {
			this.transferPieceToBoard({ tetromino, isOccupied: true });
		} else {
			this.clearOldPosition(tetromino);
			tetromino.position = newPosition;
			this.transferPieceToBoard({ tetromino, isOccupied: false });
		}
	}

	public moveRight(tetromino: Piece) {
		const newPosition = {
			...tetromino.position,
			x: tetromino.position.x + 1,
		};
		if (this.checkCollision(newPosition, tetromino)) {
			this.transferPieceToBoard({ tetromino, isOccupied: true });
		} else {
			this.clearOldPosition(tetromino);
			tetromino.position = newPosition;
			this.transferPieceToBoard({ tetromino, isOccupied: false });
		}
	}

	public spacePressed(tetromino: Piece) {
		console.log('Space pressed');
		while (!tetromino.isFixed) {
			this.moveDown(tetromino);
		}
	}

	public rotate(tetromino: Piece) {
		const oldShape = tetromino.shape;
		this.clearOldPosition(tetromino);
		tetromino.rotatePiece();
		if (this.checkCollision(tetromino.position, tetromino)) {
			tetromino.shape = oldShape;
			this.transferPieceToBoard({ tetromino, isOccupied: false });
		} else {
			this.transferPieceToBoard({ tetromino, isOccupied: false });
		}
	}

	public printBoard() {
		for (let i = 0; i < this.cells.length; i++) {
			let rowString = '';
			for (let j = 0; j < this.cells[i].length; j++) {
				const cell = this.cells[i][j];
				rowString += cell.className ? 'X ' : 'O ';
			}
			console.log(rowString);
		}
		console.log('');
	}
}
