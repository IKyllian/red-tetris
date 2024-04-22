import { zip } from 'lodash';
import {
	IPosition,
	ITetromino,
	TETROMINOES,
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
		this.position = defaultPosition;
	}
	public rotatePiece(): void {
		// Transpose the shape matrix (columns become rows)
		const transposed = zip(...this.shape);
		// Reverse each row of the transposed matrix to rotate clockwise
		this.shape = transposed.map((row) => row.reverse());
	}

	public getRandomPiece = (): ITetromino => {
		const keys = Object.keys(TETROMINOES);
		const randomIndex = Math.floor(Math.random() * keys.length);
		const tetromino = TETROMINOES[keys[randomIndex]];
		return tetromino;
	};
}
