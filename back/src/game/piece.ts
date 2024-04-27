import { zip } from 'lodash';
import {
	IPosition,
	ITetromino,
	TetriminosArray,
	TetrominoType,
} from 'src/type/tetromino.interface';
import { Board } from './board';

const JLTSZ_SRS = [
	// State 0
	[
		{ x: 0, y: 0 },
		{ x: -1, y: 0 },
		{ x: -1, y: 1 },
		{ x: 0, y: -2 },
		{ x: -1, y: -2 },
	],
	// State 1
	[
		{ x: 0, y: 0 },
		{ x: 1, y: 0 },
		{ x: 1, y: -1 },
		{ x: 0, y: 2 },
		{ x: 1, y: 2 },
	],
	// State 2
	[
		{ x: 0, y: 0 },
		{ x: 1, y: 0 },
		{ x: 1, y: 1 },
		{ x: 0, y: -2 },
		{ x: 1, y: -2 },
	],
	// State 3
	[
		{ x: 0, y: 0 },
		{ x: -1, y: 0 },
		{ x: -1, y: -1 },
		{ x: 0, y: 2 },
		{ x: -1, y: 2 },
	],
];

const I_SRS = [
	// State 0
	[
		{ x: 0, y: 0 },
		{ x: -2, y: 0 },
		{ x: 1, y: 0 },
		{ x: -2, y: -1 },
		{ x: 1, y: 2 },
	],
	// State 1
	[
		{ x: 0, y: 0 },
		{ x: -1, y: 0 },
		{ x: 2, y: 0 },
		{ x: -1, y: 2 },
		{ x: 2, y: -1 },
	],
	// State 2
	[
		{ x: 0, y: 0 },
		{ x: 2, y: 0 },
		{ x: -1, y: 0 },
		{ x: 2, y: 1 },
		{ x: -1, y: -2 },
	],
	// State 3
	[
		{ x: 0, y: 0 },
		{ x: 1, y: 0 },
		{ x: -2, y: 0 },
		{ x: 1, y: -2 },
		{ x: -2, y: 1 },
	],
];
export class Piece {
	// Ou Tetromino
	public shape: number[][];
	public className: string;
	public position: IPosition;
	private rotationState: number = 0;

	constructor() {
		const tetromino = this.getRandomPiece();
		this.shape = tetromino.shape;
		this.className = tetromino.className;
		this.position = tetromino.position;
	}
	private getRotatedShape(): number[][] {
		// Transpose the shape matrix (columns become rows)
		const transposed = zip(...this.shape);
		// Reverse each row of the transposed matrix to rotate clockwise
		return transposed.map((row) => row.reverse());
	}

	public rotate(board: Board): void {
		if (this.className === TetrominoType.O) {
			return;
		}
		const newShape = this.getRotatedShape();
		const srs = this.className === TetrominoType.I ? I_SRS : JLTSZ_SRS;
		for (let position of srs[this.rotationState]) {
			const newPosition = {
				x: this.position.x + position.x,
				y: this.position.y + position.y,
			};
			if (!board.checkCollision(newPosition, newShape)) {
				board.clearOldPosition(this);
				this.position = newPosition;
				this.shape = newShape;
				board.transferPieceToBoard(this, false);
				this.rotationState = (this.rotationState + 1) % 4;
				break;
			}
		}
	}

	public getRandomPiece = (): ITetromino => {
		const randomIndex = Math.floor(Math.random() * TetriminosArray.length);
		return TetriminosArray[randomIndex];
	};
}
