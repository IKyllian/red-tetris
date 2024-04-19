import { ICell, ISize, defaultCell } from 'src/type/cell.interface';
import _ from 'lodash';
import { IBoard } from 'src/type/board.interface';
import { IPosition, ITetromino } from 'src/type/tetromino.interface';
interface State {
	rows: ICell[][]; //board
	tetromino: ITetromino;
	position: IPosition;
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

	transferPieceToBoard = ({
		rows,
		tetromino,
		position,
		isOccupied,
	}: State) => {
		let newRows = _.cloneDeep(rows);
		tetromino.shape.forEach((row: number[], y: number) => {
			row.forEach((cell: number, x: number) => {
				// console.log(cell)
				if (cell) {
					// cell is 0 or 1
					// console.log("X = ", x, " - Position X = ", position.x," - Y = ", y, " Position Y = ", position.y);
					const occupied = isOccupied;
					const _x = x + position.x;
					const _y = y + position.y;
					newRows[_y][_x] = {
						className: tetromino.className,
						occupied,
						isDestructible: true,
					};
				}
			});
		});
	};
}
