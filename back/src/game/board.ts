import { CellType, ICell, ISize, defaultCell } from 'src/type/cell.interface';
import { IPosition } from 'src/type/tetromino.interface';
import { Piece } from './piece';

export class Board {
	public gameOver: boolean = false;

	private cells: ICell[][];
	private size: ISize;

	constructor(size: ISize) {
		this.size = size;
		this.cells = this.buildBoard(size);
	}

	public buildBoard = ({ rows, columns }: ISize): ICell[][] => {
		const builtRows = Array.from({ length: rows }, () =>
			Array.from({ length: columns }, () => ({
				...defaultCell,
			}))
		);

		return builtRows;
	};

	public clearOldPosition(tetromino: Piece, shape: number[][]) {
		shape.forEach((row: number[], y: number) => {
			if (tetromino.position.y + y < 0) return;
			row.forEach((cell: number, x: number) => {
				if (cell) {
					const _x = x + tetromino.position.x;
					const _y = y + tetromino.position.y;
					this.cells[_y][_x] = { ...defaultCell };
				}
			});
		});
	}

	public transferPieceToBoard(
		tetromino: Piece,
		shape: number[][],
		fixOnBoard: boolean
	) {
		shape.forEach((row: number[], y: number) => {
			if (tetromino.position.y + y < 0) return;
			row.forEach((cell: number, x: number) => {
				if (cell) {
					// cell is 0 or 1
					// console.log("X = ", x, " - Position X = ", position.x," - Y = ", y, " Position Y = ", position.y);
					const _x = x + tetromino.position.x;
					const _y = y + tetromino.position.y;
					if (this.cells[_y][_x].occupied) {
						this.gameOver = true;
					}
					this.cells[_y][_x] = {
						type: tetromino.type,
						occupied: fixOnBoard,
						isDestructible: true,
					};
				}
			});
		});
	}

	public checkForLines() {
		let lines = 0;
		for (let i = this.size.rows - 1; i >= 0; i--) {
			const row = this.cells[i];
			if (row.every((cell) => cell.occupied && cell.isDestructible)) {
				lines++;
				this.cells.splice(i, 1);
				this.cells.unshift(
					Array.from({ length: this.size.columns }, () => ({
						...defaultCell,
					}))
				);
				++i;
			}
		}
		return lines;
	}

	public addIndestructibleLines(nbOfLines: number) {
		const indestructibleRow: ICell[] = Array.from(
			{ length: this.size.columns },
			() => ({
				occupied: true,
				isDestructible: false,
				type: CellType.INDESTRUCTIBLE,
			})
		);
		for (let i = 0; i < nbOfLines; i++) {
			this.cells.push(indestructibleRow);
			this.cells.shift();
		}
		//TODO push back current piece if in collision ?

		// for (let i = this.size.rows - 1; i >= 0 && nbOfLines > 0; i--) {
		// 	const row = this.cells[i];
		// 	if (row[0].isDestructible) {
		// 		row.forEach((cell) => {
		// 			cell.occupied = true;
		// 			cell.isDestructible = false;
		// 			cell.className = indestructibleCell;
		// 		});
		// 		--nbOfLines;
		// 	}
		// }
	}

	public checkCollision(position: IPosition, shape: number[][]) {
		let isCollision = false;
		shape.forEach((row: number[], y: number) => {
			if (position.y + y < 0) return;
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
						isCollision = true;
					}
				}
			});
		});
		return isCollision;
	}

	public printBoard() {
		for (let i = 0; i < this.cells.length; i++) {
			let rowString = '';
			for (let j = 0; j < this.cells[i].length; j++) {
				const cell = this.cells[i][j];
				rowString += cell.occupied ? 'X ' : 'O ';
			}
			console.log(rowString + ' y: ', i);
		}
		console.log('');
	}
}
