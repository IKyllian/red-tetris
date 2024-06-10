import { getFramesPerGridCell, buildBoard, checkForLines } from 'front/utils/board.utils';
import { expect, it, describe } from 'vitest';
import { defaultCell } from 'front/types/board.types';
import { CellType } from 'front/types/tetrominoes.type';

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
                isDestructible: true,
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
    describe('getFramesPerGridCell', () => {
        it('should return the number of frames per grid cell', () => {
            const calculate = (level) => (48 - level * 5) / 2;
            expect(getFramesPerGridCell(5)).toBe(calculate(5));
            expect(getFramesPerGridCell(9)).toBe(calculate(9));
            expect(getFramesPerGridCell(11)).toBe(2.5);
            expect(getFramesPerGridCell(15)).toBe(2);
            expect(getFramesPerGridCell(18)).toBe(1.5);
            expect(getFramesPerGridCell(28)).toBe(1);
            expect(getFramesPerGridCell(30)).toBe(0.5);
        })
    })
    // describe('compareCells', () => {
    //     it('should return true because cells are same', () => {
    //         const size = { rows: 20, columns: 10 };
    //         let cells = buildBoard(size).cells
    //         cells[5][2].type = CellType.I
    //         cells[5][3].type = CellType.I
    //         cells[5][4].type = CellType.I
    //         cells[5][5].type = CellType.I
    //         const tetromino = {
    //             type: CellType;
    //             position: IPosition;
    //             rotationState: number;
    //         }
    //         expect(compareCells(cells, cells, CellType.I)).toBe(true);
    //     })
    // })
    describe('checkForLines (check if lines are complete and if so should destroy them + return number of line destroyed)', () => {
        const size = { rows: 10, columns: 10 };
        it ('full empty lines, should return 0', () => {
            const board = buildBoard(size);
            expect(checkForLines(board)).toBe(0);
        })
        it ('lines partly filled, should return 0', () => {
            const board = buildBoard(size);
            // fill some cells to occupied
            for(let i = size.columns - 2; i >= 0; i--) {
                board.cells[size.rows - 1][i].occupied = true; 
                board.cells[size.rows - 2][i].occupied = true; 
            }
            expect(checkForLines(board)).toBe(0);
        })
        it('one line complete, should return 1', () => {
            const board = buildBoard(size);
            const colums = Array.from({ length: size.columns }, () => ({ ...defaultCell }))

            // fill last line to occupied
            for(let i = size.columns - 1; i >= 0; i--) {
                board.cells[size.rows - 1][i].occupied = true; 
            }
            expect(checkForLines(board)).toBe(1);
            expect(board.cells[size.rows - 1]).toEqual(expect.arrayContaining(colums))
        })
        it('multiple lines complete', () => {
            const board = buildBoard(size);
            // fill multiple lines to occupied
            for(let i = size.columns - 1; i >= 0; i--) {
                board.cells[size.rows - 1][i].occupied = true;
                board.cells[size.rows - 2][i].occupied = true;
                board.cells[size.rows - 3][i].occupied = true;
            }
            expect(checkForLines(board)).toBe(3);
        })
        it('line complete but not destructible, should return 0', () => {
            const board = buildBoard(size);
            const colums = Array.from({ length: size.columns }, () => ({ ...defaultCell, occupied: true, isDestructible: false }))
            // fill multiple lines to occupied
            for(let i = size.columns - 1; i >= 0; i--) {
                board.cells[size.rows - 1][i].occupied = true; 
                board.cells[size.rows - 1][i].isDestructible = false;
            }
            expect(checkForLines(board)).toBe(0);
            expect(board.cells[size.rows - 1]).toEqual(expect.arrayContaining(colums))
        })
    })
})
