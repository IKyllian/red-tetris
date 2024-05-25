import { zip } from 'lodash';
import {
	IPosition,
	ITetromino,
	I_SRS,
	I_TetrominoShape,
	JLTSZ_SRS,
	J_TetrominoShape,
	L_TetrominoShape,
	O_TetrominoShape,
	S_TetrominoShape,
	T_TetrominoShape,
	TetriminosArray,
	Z_TetrominoShape,
} from 'src/type/tetromino.interface';
import { Board } from './board';
import { CellType } from 'src/type/cell.interface';

export class Piece {
	// Ou Tetromino
	// public shape: number[][];
	public type: CellType;
	public position: IPosition;
	private rotationState: number = 0;

	constructor(tetromino: ITetromino) {
		// const tetromino = this.getRandomPiece();
		this.type = tetromino.type;
		this.position = tetromino.position;
		// this.shape = this.getShape();
	}
	public getShape(rotationState: number = this.rotationState): number[][] {
		switch (this.type) {
			case CellType.I:
				return I_TetrominoShape[rotationState];
			case CellType.J:
				return J_TetrominoShape[rotationState];
			case CellType.L:
				return L_TetrominoShape[rotationState];
			case CellType.O:
				return O_TetrominoShape;
			case CellType.S:
				return S_TetrominoShape[rotationState];
			case CellType.T:
				return T_TetrominoShape[rotationState];
			default:
				return Z_TetrominoShape[rotationState];
		}
	}
	// private getRotatedShape(): number[][] {
	// 	// Transpose the shape matrix (columns become rows)
	// 	const transposed = zip(...this.shape);
	// 	// Reverse each row of the transposed matrix to rotate clockwise
	// 	return transposed.map((row) => row.reverse());
	// }

	public rotate(board: Board): void {
		if (this.type === CellType.O) {
			return;
		}
		const currentShape = this.getShape();
		const newRotation = (this.rotationState + 1) % 4;
		const newShape = this.getShape(newRotation);
		const srs = this.type === CellType.I ? I_SRS : JLTSZ_SRS;
		for (let position of srs[this.rotationState]) {
			const newPosition = {
				x: this.position.x + position.x,
				y: this.position.y + position.y,
			};
			if (!board.checkCollision(newPosition, newShape)) {
				board.clearOldPosition(this, currentShape);
				this.position = newPosition;
				board.transferPieceToBoard(this, newShape, false);
				this.rotationState = newRotation;
				break;
			}
		}
	}

	public getRandomPiece = (): ITetromino => {
		const randomIndex = Math.floor(Math.random() * TetriminosArray.length);
		return TetriminosArray[randomIndex];
	};
}
