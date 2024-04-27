import { zip } from 'lodash';
import {
	IPosition,
	ITetromino,
	TetriminosArray,
	defaultPosition,
} from 'src/type/tetromino.interface';

export class Piece {
	// Ou Tetromino
	public shape: number[][];
	public className: string;
	public position: IPosition;

	constructor() {
		const tetromino = this.getRandomPiece();
		this.shape = tetromino.shape;
		this.className = tetromino.className;
		this.position = tetromino.position;
	}
	public getRotatedShape(): number[][] {
		// Transpose the shape matrix (columns become rows)
		const transposed = zip(...this.shape);
		// Reverse each row of the transposed matrix to rotate clockwise
		return transposed.map((row) => row.reverse());
	}

	public getRandomPiece = (): ITetromino => {
		const randomIndex = Math.floor(Math.random() * TetriminosArray.length);
		return TetriminosArray[randomIndex];
	};
}
