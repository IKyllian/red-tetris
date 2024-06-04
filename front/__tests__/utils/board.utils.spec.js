// import { ISize, defaultCell } from '../../src/types/board.types';
// import { buildBoard } from 'front/utils/board.utils';
import { buildBoard } from '../../src/utils/board.utils'
// import {describe, expect, it} from '@jest/globals';
import { expect, it } from 'vitest';
describe('utils/board', () => {
    describe('buildBoard', () => {
        it('should return a board object with a size that depends of params ', () => {
            const size = { rows: 10, columns: 10 };
            const board = buildBoard(size);
            expect(board.size).toBe(size);
            // expect(board.cells).toContain(defaultCell)
        })
    })
})
