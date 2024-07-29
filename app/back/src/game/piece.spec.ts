import { Piece } from './piece';
import { Board } from './board';
import { CellType } from '../type/cell.interface';
import { ITetromino, IPosition } from '../type/tetromino.interface';

describe('Piece', () => {
	let boardMock: jest.Mocked<Board>;
	let piece: Piece;

	beforeEach(() => {
		boardMock = {
			checkCollision: jest.fn(),
		} as any;

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

	it('should return the correct shape for the given rotation state', () => {
		const shape = piece.getShape();
		expect(shape).toEqual([
			[0, 0, 0, 0],
			[1, 1, 1, 1],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
		]);
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
