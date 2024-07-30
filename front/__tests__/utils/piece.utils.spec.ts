import { describe, expect, Mock, it, vi, afterEach, beforeEach } from "vitest"
import {
    getTetrominoClassName,
    getShape,
    getPosRight,
    getPosLeft,
    getPosDown,
    getNextPiece,
    getPieceIndex,
    clearOldPosition,
    checkCollision,
    transferPieceToBoard,
    transferPreviewToBoard
} from 'front/utils/piece.utils';
import {
	CellType,
	IPosition,
	ITetromino,
	I_TetrominoShape,
	J_TetrominoShape,
	L_TetrominoShape,
	O_TetrominoShape,
	S_TetrominoShape,
	T_TetrominoShape,
	TetriminosArray,
	Z_TetrominoShape,
} from 'front/types/tetrominoes.type';
import { PIECES_BUFFER_SIZE } from 'front/utils/game.utils'
import { defaultCell, ICell, IBoard } from 'front/types/board.types';
import { buildBoard } from 'front/utils/board.utils';

describe('utils/piece', () => {
    const pos = {
        x: 10,
        y: 15
    }

    describe('getTetrominoClassName', () => {
        it('should return tetromino classname without preview', () => {
            expect(getTetrominoClassName(CellType.I)).toBe('tetromino tetromino_I')
            expect(getTetrominoClassName(CellType.J)).toBe('tetromino tetromino_J')
            expect(getTetrominoClassName(CellType.L)).toBe('tetromino tetromino_L')
            expect(getTetrominoClassName(CellType.O)).toBe('tetromino tetromino_O')
            expect(getTetrominoClassName(CellType.S)).toBe('tetromino tetromino_S')
            expect(getTetrominoClassName(CellType.T)).toBe('tetromino tetromino_T')
            expect(getTetrominoClassName(CellType.Z)).toBe('tetromino tetromino_Z')
            expect(getTetrominoClassName(CellType.INDESTRUCTIBLE)).toBe('tetromino tetromino_indestructible')
        })
        it('should return empty className', () => {
            expect(getTetrominoClassName(CellType.W)).toBe('')
            expect(getTetrominoClassName(CellType.W, true)).toBe('')
        })
        it('should return tetromino classname with preview', () => {
            expect(getTetrominoClassName(CellType.I, true)).toBe('tetromino tetromino_I drop-preview')
            expect(getTetrominoClassName(CellType.J, true)).toBe('tetromino tetromino_J drop-preview')
            expect(getTetrominoClassName(CellType.L, true)).toBe('tetromino tetromino_L drop-preview')
            expect(getTetrominoClassName(CellType.O, true)).toBe('tetromino tetromino_O drop-preview')
            expect(getTetrominoClassName(CellType.S, true)).toBe('tetromino tetromino_S drop-preview')
            expect(getTetrominoClassName(CellType.T, true)).toBe('tetromino tetromino_T drop-preview')
            expect(getTetrominoClassName(CellType.Z, true)).toBe('tetromino tetromino_Z drop-preview')
        })
        it('should return without preview classname because type is indestructible', () => {
            expect(getTetrominoClassName(CellType.INDESTRUCTIBLE, true)).toBe('tetromino tetromino_indestructible')
        })
    })
    describe('getShape', () => {
        it('should return the shape of a given tetromino based on the rotation state', () => {
            for (const [index, shape] of I_TetrominoShape.entries()) {
                expect(getShape(CellType.I, index)).toEqual(shape)
            }
            for (const [index, shape] of J_TetrominoShape.entries()) {
                expect(getShape(CellType.J, index)).toEqual(shape)
            }
            for (const [index, shape] of L_TetrominoShape.entries()) {
                expect(getShape(CellType.L, index)).toEqual(shape)
            }
            expect(getShape(CellType.O, 0)).toEqual(O_TetrominoShape)
            expect(getShape(CellType.O, 1)).toEqual(O_TetrominoShape)
            for (const [index, shape] of S_TetrominoShape.entries()) {
                expect(getShape(CellType.S, index)).toEqual(shape)
            }
            for (const [index, shape] of T_TetrominoShape.entries()) {
                expect(getShape(CellType.T, index)).toEqual(shape)
            }
            for (const [index, shape] of T_TetrominoShape.entries()) {
                expect(getShape(CellType.T, index)).toEqual(shape)
            }
        })
        it('should return the shape of CellType.Z by default', () => {
            for (const [index, shape] of J_TetrominoShape.entries()) {
                expect(getShape(CellType.J, index)).toEqual(shape)
            }
        })
        it('should return a default shape (shape[0]) when rotation state is too large', () => {
            expect(getShape(CellType.I, 20)).toEqual(I_TetrominoShape[0])
            expect(getShape(CellType.J, 20)).toEqual(J_TetrominoShape[0])
            expect(getShape(CellType.L, 20)).toEqual(L_TetrominoShape[0])
            expect(getShape(CellType.O, 20)).toEqual(O_TetrominoShape)
            expect(getShape(CellType.S, 20)).toEqual(S_TetrominoShape[0])
            expect(getShape(CellType.T, 20)).toEqual(T_TetrominoShape[0])
            expect(getShape(CellType.Z, 20)).toEqual(Z_TetrominoShape[0]) 
        }) 
    })
    describe('getPosRight', () => {
        it('should return the received position with x + 1', () => {
            expect(getPosRight(pos)).toEqual({...pos, x: pos.x + 1})
        })
    })
    describe('getPosLeft', () => {
        it('should return the received position with x - 1', () => {
            expect(getPosLeft(pos)).toEqual({...pos, x: pos.x - 1})
        })
    })
    describe('getPosDown', () => {
        it('should return the received position with y + 1', () => {
            expect(getPosDown(pos)).toEqual({...pos, y: pos.y + 1})
        })
    })
    describe('getNextPiece', () => {
        it('should return the correct piece based on the mocked RNG value', () => {
            const mockRNG = vi.fn();
            mockRNG.mockReturnValue(0.5);
    
            const piece = getNextPiece(mockRNG);
    
            const expectedIndex = Math.floor(0.5 * TetriminosArray.length);
            const expectedPiece = { ...TetriminosArray[expectedIndex] };
            expect(piece).toEqual(expectedPiece);
        });
    
        it('should return the first piece when RNG returns 0', () => {
            const mockRNG = vi.fn();
            mockRNG.mockReturnValue(0);
    
            const piece = getNextPiece(mockRNG);
            const expectedPiece = { ...TetriminosArray[0] };
            
            expect(piece).toEqual(expectedPiece);
        });
    
        it('should return the last piece when RNG returns close to 1', () => {
            const mockRNG = vi.fn();
            
            mockRNG.mockReturnValue(0.999);
    
            const piece = getNextPiece(mockRNG);
    
            const expectedIndex = Math.floor(0.999 * TetriminosArray.length);
            const expectedPiece = { ...TetriminosArray[expectedIndex] };
    
            expect(piece).toEqual(expectedPiece);
        });

        it('should return the first piece when RNG is too big', () => {
            const mockRNG = vi.fn();
            
            mockRNG.mockReturnValue(12);
    
            const piece = getNextPiece(mockRNG);
            const expectedPiece = { ...TetriminosArray[0] };
    
            expect(piece).toEqual(expectedPiece);
        });
    })


    describe('checkCollision', () => {
        const size = { rows: 5, columns: 5 };
        const shape = O_TetrominoShape;
        it('should return false for no collision', () => {
            const board = buildBoard(size);
            const position: IPosition = { x: 1, y: 1 };

            const result = checkCollision(board, position, shape);
            expect(result).toBe(false);
        });

        it('should return true for collision with board boundaries', () => {
            const board = buildBoard(size);
            const position: IPosition = { x: 4, y: 4 };

            const result = checkCollision(board, position, shape);
            expect(result).toBe(true);
        });

        it('should return true for collision with occupied cells', () => {
            const board = buildBoard(size);
            board.cells[2][2] = { ...board.cells[2][2], occupied: true };
            const position: IPosition = { x: 1, y: 1 };

            const result = checkCollision(board, position, shape);
            expect(result).toBe(true);
        });

        it('should handle negative y position correctly', () => {
            const board = buildBoard(size);
            const position: IPosition = { x: 1, y: -1 };

            const result = checkCollision(board, position, shape);
            expect(result).toBe(false);
        });

        it('should return true for collision with left boundary', () => {
            const board = buildBoard(size);
            const position: IPosition = { x: -1, y: 2 };

            const result = checkCollision(board, position, shape);
            expect(result).toBe(true);
        });

        it('should return true for collision with right boundary', () => {
            const board = buildBoard(size);
            const position: IPosition = { x: 4, y: 2 };

            const result = checkCollision(board, position, shape);
            expect(result).toBe(true);
        });
    });

    describe('clearOldPosition', () => {
        const size = { rows: 5, columns: 5 };
        const board = buildBoard(size)

        it('should clear the old position of the tetromino on the board', () => {
            const newCell = { occupied: false, type: CellType.O, isPreview: true }
            const tetromino = {...TetriminosArray[3], position: { x: 1, y: 1 }}
            board.cells[1][1] = newCell;
            board.cells[1][2] = newCell;
            board.cells[2][1] = newCell;
            board.cells[2][2] = newCell;

            const newCells = clearOldPosition(tetromino, O_TetrominoShape, board);
            const expectedCells: ICell[][] = Array.from({ length: size.rows }, () =>
                Array.from({ length: size.columns }, () => ({ ...defaultCell }))
            );
    
            expect(newCells).toEqual(expectedCells);
        });
    
        it('should not clear cells outside the board', () => {
            const tetrominoOutOfBounds: ITetromino = {...TetriminosArray[3], position: { x: 3, y: -1 }}
            const newCells = clearOldPosition(tetrominoOutOfBounds, O_TetrominoShape, board);
    
            const expectedCells: ICell[][] = Array.from({ length: size.rows }, () =>
                Array.from({ length: size.columns }, () => ({ ...defaultCell }))
            );
    
            expect(newCells).toEqual(expectedCells);
        });
    });

    describe('transferPieceToBoard', () => {
        const size = { rows: 5, columns: 5 };
        let board: IBoard;
        let tetromino: ITetromino;
    
        beforeEach(() => {
            board = buildBoard(size);
            tetromino = {...TetriminosArray[3], position: { x: 1, y: 1 }};
        });
    
        it('should transfer the piece to the board without fixing it', () => {
            const result = transferPieceToBoard(board, tetromino, O_TetrominoShape, false);
            expect(result[1][1]).toEqual({ type: CellType.O, occupied: false, isPreview: false });
            expect(result[1][2]).toEqual({ type: CellType.O, occupied: false, isPreview: false });
            expect(result[2][1]).toEqual({ type: CellType.O, occupied: false, isPreview: false });
            expect(result[2][2]).toEqual({ type: CellType.O, occupied: false, isPreview: false });
        });
    
        it('should transfer the piece to the board and fix it', () => {
            const result = transferPieceToBoard(board, tetromino, O_TetrominoShape, true);
            expect(result[1][1]).toEqual({ type: CellType.O, occupied: true, isPreview: false });
            expect(result[1][2]).toEqual({ type: CellType.O, occupied: true, isPreview: false });
            expect(result[2][1]).toEqual({ type: CellType.O, occupied: true, isPreview: false });
            expect(result[2][2]).toEqual({ type: CellType.O, occupied: true, isPreview: false });
        });
    });

    describe('transferPreviewToBoard', () => {
        const size = { rows: 5, columns: 5 };
        let board: IBoard;
        let tetromino: ITetromino;
    
        beforeEach(() => {
            board = buildBoard(size);
            tetromino = {...TetriminosArray[3], position: { x: 1, y: 1 }};
        });
    
        it('should transfer the preview to the board', () => {
            const result = transferPreviewToBoard(board, tetromino, O_TetrominoShape);
            expect(result[1][1]).toEqual({ type: CellType.O, occupied: false, isPreview: true });
            expect(result[1][2]).toEqual({ type: CellType.O, occupied: false, isPreview: true });
            expect(result[2][1]).toEqual({ type: CellType.O, occupied: false, isPreview: true });
            expect(result[2][2]).toEqual({ type: CellType.O, occupied: false, isPreview: true });
        });
    
        it('should not overwrite non-empty cells', () => {
            board.cells[1][1] = { type: CellType.Z, occupied: true, isPreview: false };
            const result = transferPreviewToBoard(board, tetromino, O_TetrominoShape);
            expect(result[1][1]).toEqual({ type: CellType.Z, occupied: true, isPreview: false });
            expect(result[1][2]).toEqual({ type: CellType.O, occupied: false, isPreview: true });
            expect(result[2][1]).toEqual({ type: CellType.O, occupied: false, isPreview: true });
            expect(result[2][2]).toEqual({ type: CellType.O, occupied: false, isPreview: true });
        });
    });

    describe('getPieceIndex', () => {
        it('should return the index of the piece in the array', () => {
            const pieceIndex = 4;
            const result = pieceIndex % PIECES_BUFFER_SIZE
            expect(getPieceIndex(pieceIndex)).toEqual(result)
        })
    })
})