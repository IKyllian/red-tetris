import { getFramesPerGridCell, buildBoard } from 'front/utils/board.utils';
import { describe } from 'node:test';
import { expect, it } from 'vitest';

describe('utils/board', () => {
    describe('buildBoard', () => {
        it('should return a board object with a size that depends of params ', () => {
            const size = { rows: 10, columns: 10 };
            const board = buildBoard(size);
            expect(board.size).toStrictEqual(size);
            // expect(board.cells).toContain(defaultCell)
        })
    })
    describe('getFramesPerGridCell', () => {
        it('should return the number of frames per grid cell', () => {
            expect(getFramesPerGridCell(28)).toBe(1);
        })
    })
})
