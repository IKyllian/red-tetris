import { describe, vi, it, beforeEach, expect, Mock } from "vitest";
import { IPosition } from 'front/types/tetrominoes.type';
import { checkCollision, getPosDown } from 'front/utils/piece.utils'
import { buildBoard } from 'front/utils/board.utils';
import { getDropPosition } from 'front/utils/drop.utils';

describe('drop utils', () => {
    vi.mock('front/utils/piece.utils', () => ({
        checkCollision: vi.fn(),
        getPosDown: vi.fn(),
    }));

    const defaultPosition: IPosition = { x: 1, y: 1 };
    const shape = [
        [1, 1],
        [1, 1],
    ];
    const size = { rows: 5, columns: 5 };

    describe('getDropPosition', () => {
        beforeEach(() => {
            vi.clearAllMocks();
        });
    
        it('should return the position where the tetromino should drop', () => {
            const board = buildBoard(size);
            (getPosDown as Mock).mockImplementation((pos) => ({ ...pos, y: pos.y + 1 }));
            (checkCollision as Mock).mockImplementation((_, pos, __) => pos.y >= 3);
    
            const result = getDropPosition(board, defaultPosition, shape);
    
            expect(result).toEqual({ x: 1, y: 2 });
            expect(getPosDown).toHaveBeenCalledTimes(2);
            expect(checkCollision).toHaveBeenCalledTimes(2);
        });
    
        it('should handle no movement if already colliding', () => {
            const board = buildBoard(size);
            (getPosDown as Mock).mockImplementation((pos) => ({ ...pos, y: pos.y + 1 }));
            (checkCollision as Mock).mockImplementation(() => true);
    
            const result = getDropPosition(board, defaultPosition, shape);
    
            expect(result).toEqual(defaultPosition);
            expect(getPosDown).toHaveBeenCalledTimes(1);
            expect(checkCollision).toHaveBeenCalledTimes(1);
        });
    
        it('should handle multiple downward movements until collision', () => {
            const board = buildBoard(size);
            (getPosDown as Mock).mockImplementation((pos) => ({ ...pos, y: pos.y + 1 }));
            (checkCollision as Mock).mockImplementation((board, pos, shape) => pos.y >= 4);
    
            const result = getDropPosition(board, defaultPosition, shape);
    
            expect(result).toEqual({ x: 1, y: 3 });
            expect(getPosDown).toHaveBeenCalledTimes(3);
            expect(checkCollision).toHaveBeenCalledTimes(3);
        });
    });   
})