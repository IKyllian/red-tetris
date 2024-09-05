import { buildBoard } from 'front/utils/board.utils';
import { expect, it, describe } from 'vitest';
import { defaultCell } from 'front/types/board.types';
import { CellType } from 'front/types/tetrominoes.type';
import {
	CellType
} from 'front/types/tetrominoes.type';

describe('utils/board', () => {
    describe('buildBoard', () => {
        it('should return a board object with a size that depends of params with default cells', () => {
            const size = { rows: 20, columns: 10 };
            const colums = Array.from({ length: size.columns }, () => ({ ...defaultCell }))
            const board = buildBoard(size);
            expect(board.size).toStrictEqual(size);
            expect(board.cells.length).toBe(size.rows);
            expect(board.cells[0].length).toBe(size.columns);
            expect(board.cells[0]).toEqual(expect.arrayContaining(colums));
        })
        it('should return a board object with a size that depends of params with custom cells', () => {
            const size = { rows: 20, columns: 10 };
            const cells = { 
                occupied: false,
                type: CellType.I,
                isPreview: false
            }
            const colums = Array.from({ length: size.columns }, () => ({ ...cells }))
            const board = buildBoard({...size, boardCells: cells});
            expect(board.size).toStrictEqual(size);
            expect(board.cells.length).toBe(size.rows);
            expect(board.cells[0].length).toBe(size.columns);
            expect(board.cells[0]).toEqual(expect.arrayContaining(colums));
        })
    })
})
