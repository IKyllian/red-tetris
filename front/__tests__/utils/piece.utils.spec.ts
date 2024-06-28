import { describe, expect, Mock, it, vi, afterEach, beforeEach } from "vitest"
import { CellType } from 'front/types/tetrominoes.type';
import {
    getTetrominoClassName,
    getShape,
    getPosRight,
    getPosLeft,
    getPosDown,
    getNextPiece,
    getPieceIndex
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

    // describe('clearOldPosition', () => {
    //     const tetromino = {
    //         type: CellType.J,
    //         position: { x: 3, y: 0 },
    //         rotationState: 0
    //     }
    //     const shape = [
    //         [1, 0, 0],
    //         [1, 1, 1],
    //         [0, 0, 0]
    //     ]
    //     const board = buildBoard({
    //         rows: 2,
    //         cols: 2,
    //         boardCells: {
    //             occupied: true,
    //             type: CellType.J,
    //             isPreview: false,
    //         }
    //     })


    // })


    describe('getPieceIndex', () => {
        it('should return the index of the piece in the array', () => {
            const pieceIndex = 4;
            const result = pieceIndex % PIECES_BUFFER_SIZE
            expect(getPieceIndex(pieceIndex)).toEqual(result)
        })
    })
})