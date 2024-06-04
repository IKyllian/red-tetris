import { expect } from "vitest"
import { CellType } from 'front/types/tetrominoes.type';
import { getTetrominoClassName } from 'front/utils/piece.utils';

describe('utils/piece', () => {
    describe('getTetrominoClassName', () => {
        it('should return tetromino classname without preview', () => {
            expect(getTetrominoClassName(CellType.I)).toBe('tetromino tetromino_I')
            expect(getTetrominoClassName(CellType.L)).toBe('tetromino tetromino_L')
            expect(getTetrominoClassName(CellType.INDESTRUCTIBLE)).toBe('tetromino tetromino_indestructible')
        })
        it('should return empty className', () => {
            expect(getTetrominoClassName(CellType.W)).toBe('')
            expect(getTetrominoClassName(CellType.W, true)).toBe('')
        })
        it('should return tetromino classname with preview', () => {
            expect(getTetrominoClassName(CellType.I, true)).toBe('tetromino tetromino_I drop-preview')
        })
    })
    describe('getTetrominoClassName', () => {
        it('should return tetromino classname without preview', () => {
            expect(getTetrominoClassName(CellType.I)).toBe('tetromino tetromino_I')
            expect(getTetrominoClassName(CellType.L)).toBe('tetromino tetromino_L')
            expect(getTetrominoClassName(CellType.INDESTRUCTIBLE)).toBe('tetromino tetromino_indestructible')
        })
        it('should return empty className', () => {
            expect(getTetrominoClassName(CellType.W)).toBe('')
            expect(getTetrominoClassName(CellType.W, true)).toBe('')
        })
        it('should return tetromino classname with preview', () => {
            expect(getTetrominoClassName(CellType.I, true)).toBe('tetromino tetromino_I drop-preview')
        })
    })
})
