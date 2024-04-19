import { ITetromino, TETROMINOES } from 'src/type/tetromino.interface';

export class Piece {
	// Ou Tetromino
	private shape: number[][];
	private className: string;

	constructor() {
		const tetromino = this.getRandomPiece();
		this.shape = tetromino.shape;
		this.className = tetromino.className;
	}

	rotatePiece(shape: number[]): void {}

	getRandomPiece = (): ITetromino => {
		const keys = Object.keys(TETROMINOES);
		const randomIndex = Math.floor(Math.random() * keys.length);
		const tetromino = TETROMINOES[keys[randomIndex]];
		return tetromino;
	};
}
