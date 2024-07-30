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
	Z_TetrominoShape,
} from '../type/tetromino.interface';
import { Board } from './board';
import { CellType } from '../type/cell.interface';

export class Piece {
	public type: CellType;
	public position: IPosition;
	private rotationState: number = 0;

	constructor(tetromino: ITetromino) {
		this.type = tetromino.type;
		this.position = { ...tetromino.position };
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

	public rotate(board: Board): boolean {
		let isNewShape = false;
		if (this.type === CellType.O) {
			return isNewShape;
		}
		const newRotation = (this.rotationState + 1) % 4;
		const newShape = this.getShape(newRotation);
		const srs = this.type === CellType.I ? I_SRS : JLTSZ_SRS;
		for (let position of srs[this.rotationState]) {
			const newPosition = {
				x: this.position.x + position.x,
				y: this.position.y + position.y,
			};
			if (!board.checkCollision(newPosition, newShape)) {
				this.position = newPosition;
				this.rotationState = newRotation;
				isNewShape = true;
				break;
			}
		}
		return isNewShape;
	}
}
