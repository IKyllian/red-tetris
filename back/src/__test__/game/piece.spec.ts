import { Board } from '../../game/board';
import { Piece } from '../../game/piece';
import { CellType } from '../../type/cell.interface';
import {
	I_TetrominoShape,
	J_TetrominoShape,
	L_TetrominoShape,
	O_TetrominoShape,
	S_TetrominoShape,
	T_TetrominoShape,
	Z_TetrominoShape,
	ITetromino,
	IPosition,
} from '../../type/tetromino.interface';

describe('Piece', () => {
	let boardMock: jest.Mocked<Board>;

	beforeEach(() => {
		boardMock = {
			checkCollision: jest.fn(),
		} as any;
	});

	describe('rotate', () => {
		it('should return the correct shape for the given rotation state', () => {
			const pieces = [
				{
					piece: new Piece({
						type: CellType.I,
						position: { x: 0, y: 0 },
					}),
					shape: I_TetrominoShape[0],
				},
				{
					piece: new Piece({
						type: CellType.J,
						position: { x: 0, y: 0 },
					}),
					shape: J_TetrominoShape[0],
				},
				{
					piece: new Piece({
						type: CellType.L,
						position: { x: 0, y: 0 },
					}),
					shape: L_TetrominoShape[0],
				},
				{
					piece: new Piece({
						type: CellType.O,
						position: { x: 0, y: 0 },
					}),
					shape: O_TetrominoShape,
				},
				{
					piece: new Piece({
						type: CellType.S,
						position: { x: 0, y: 0 },
					}),
					shape: S_TetrominoShape[0],
				},
				{
					piece: new Piece({
						type: CellType.T,
						position: { x: 0, y: 0 },
					}),
					shape: T_TetrominoShape[0],
				},
				{
					piece: new Piece({
						type: CellType.Z,
						position: { x: 0, y: 0 },
					}),
					shape: Z_TetrominoShape[0],
				},
				{
					piece: new Piece({
						type: CellType.INDESTRUCTIBLE,
						position: { x: 0, y: 0 },
					}),
					shape: Z_TetrominoShape[0],
				},
				{
					piece: new Piece({
						type: CellType.EMPTY,
						position: { x: 0, y: 0 },
					}),
					shape: Z_TetrominoShape[0],
				},
			];
			pieces.forEach(({ piece, shape }) => {
				expect(piece.getShape()).toEqual(shape);
			});
		});
	});

	describe('rotate with Piece of type I', () => {
		let piece: Piece;

		beforeEach(() => {
			const tetromino: ITetromino = {
				type: CellType.I,
				position: { x: 0, y: 0 },
			};
			piece = new Piece(tetromino);
		});

		it('should initialize correctly', () => {
			expect(piece.type).toBe(CellType.I);
			expect(piece.position).toEqual({ x: 0, y: 0 });
			expect(piece['rotationState']).toBe(0);
		});

		it('should rotate piece and update position and rotation state', () => {
			boardMock.checkCollision.mockReturnValueOnce(false); // No collision

			const initialPosition: IPosition = { ...piece.position };
			const initialRotationState = piece['rotationState'];

			const result = piece.rotate(boardMock);

			expect(result).toBe(true);
			expect(piece.position).toEqual(initialPosition);
			expect(piece['rotationState']).toBe((initialRotationState + 1) % 4);
		});

		it('should rotate piece if collision occurs but srs finds an alternative position', () => {
			boardMock.checkCollision
				.mockReturnValueOnce(true)
				.mockReturnValueOnce(false); // Collision then no collision

			const initialPosition: IPosition = { ...piece.position };
			const initialRotationState = piece['rotationState'];

			const result = piece.rotate(boardMock);

			expect(result).toBe(true);
			expect(piece.position).not.toEqual(initialPosition);
			expect(piece['rotationState']).toBe((initialRotationState + 1) % 4);
		});

		it('should not rotate piece if collision occurs and srs cant find any alternative position', () => {
			boardMock.checkCollision.mockReturnValue(true); // Collision

			const initialPosition: IPosition = { ...piece.position };
			const initialRotationState = piece['rotationState'];

			const result = piece.rotate(boardMock);

			expect(result).toBe(false);
			expect(piece.position).toEqual(initialPosition);
			expect(piece['rotationState']).toBe(initialRotationState);
		});

		it('should not rotate O type piece', () => {
			piece = new Piece({ type: CellType.O, position: { x: 0, y: 0 } });
			const result = piece.rotate(boardMock);
			expect(result).toBe(false);
		});
	});

	describe('rotate with piece type different of I', () => {
		let piece: Piece;

		beforeEach(() => {
			const tetromino: ITetromino = {
				type: CellType.Z,
				position: { x: 0, y: 0 },
			};
			piece = new Piece(tetromino);
		});

		it('should rotate piece and update position and rotation state', () => {
			boardMock.checkCollision.mockReturnValueOnce(false); // No collision

			const initialPosition: IPosition = { ...piece.position };
			const initialRotationState = piece['rotationState'];

			const result = piece.rotate(boardMock);

			expect(result).toBe(true);
			expect(piece.position).toEqual(initialPosition);
			expect(piece['rotationState']).toBe((initialRotationState + 1) % 4);
		});

		it('should rotate piece if collision occurs but srs finds an alternative position', () => {
			boardMock.checkCollision
				.mockReturnValueOnce(true)
				.mockReturnValueOnce(false); // Collision then no collision

			const initialPosition: IPosition = { ...piece.position };
			const initialRotationState = piece['rotationState'];

			const result = piece.rotate(boardMock);

			expect(result).toBe(true);
			expect(piece.position).not.toEqual(initialPosition);
			expect(piece['rotationState']).toBe((initialRotationState + 1) % 4);
		});

		it('should not rotate piece if collision occurs and srs cant find any alternative position', () => {
			boardMock.checkCollision.mockReturnValue(true); // Collision

			const initialPosition: IPosition = { ...piece.position };
			const initialRotationState = piece['rotationState'];

			const result = piece.rotate(boardMock);

			expect(result).toBe(false);
			expect(piece.position).toEqual(initialPosition);
			expect(piece['rotationState']).toBe(initialRotationState);
		});
	});
});
