import { describe, vi, it, expect, beforeEach } from 'vitest';
import { handleInput } from 'front/utils/handle-inputs.utils';
import { defaultGameState } from 'front/store/game.slice'
import { rotate, moveDown, changeStatePiecePosition, hardDrop } from 'front/utils/piece-move.utils'
import {
	getPosLeft,
	getPosRight,
} from 'front/utils/piece.utils';

enum Commands {
	ROTATE,
	MOVE_DOWN,
	MOVE_LEFT,
	MOVE_RIGHT,
	HARD_DROP,
}

describe('handle-inputs.utils', () => {
    describe('handle inputs', () => {
        beforeEach(() => {
            vi.mock('front/utils/piece.utils', () => ({
                getPosLeft: vi.fn(),
                getPosRight: vi.fn(),
            }))

            vi.mock('front/utils/handle-inputs.utils', async (importOriginal) => {
                const actual = await importOriginal(); // Import the original module
                return {
                  ...actual as any,
                };
            });

            vi.mock('front/utils/piece-move.utils', () => ({
                rotate: vi.fn(),
                moveDown: vi.fn(),
                changeStatePiecePosition: vi.fn(),
                hardDrop: vi.fn(),
            }));
            vi.clearAllMocks();
        })
    
        const state = defaultGameState;

        it('should call rotate on rotate command', () => {
            const command = Commands.ROTATE;
            handleInput(command, state);
            expect(rotate).toHaveBeenCalledWith(state);
        });
        it('should call moveDown on MOVE_DOWN command', () => {
            const command = Commands.MOVE_DOWN;
            handleInput(command, state);
            expect(moveDown).toHaveBeenCalledWith(state);
        });
        it('should call changeStatePiecePosition on MOVE_LEFT command', () => {
            const command = Commands.MOVE_LEFT;
            handleInput(command, state);
            expect(changeStatePiecePosition).toHaveBeenCalledWith(state, getPosLeft);
        });
        it('should call changeStatePiecePosition on MOVE_RIGHT command', () => {
            const command = Commands.MOVE_RIGHT;
            handleInput(command, state);
            expect(changeStatePiecePosition).toHaveBeenCalledWith(state, getPosRight);
        });
        it('should call hardDrop on HARD_DROP command', () => {
            const command = Commands.HARD_DROP;
            handleInput(command, state);
            expect(hardDrop).toHaveBeenCalledWith(state);
        });
        it('should call rotate on rotate command', () => {
            const state = defaultGameState;
            const command = 42;
            handleInput(command, state);
            expect(rotate).not.toHaveBeenCalled()
            expect(moveDown).not.toHaveBeenCalled()
            expect(changeStatePiecePosition).not.toHaveBeenCalled()
            expect(hardDrop).not.toHaveBeenCalled()
            expect(state).toBe(defaultGameState)
        });
    })
})