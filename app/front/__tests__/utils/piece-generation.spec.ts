import { describe, expect, Mock, it, vi, afterEach, beforeEach } from "vitest"
import { CellType } from 'front/types/tetrominoes.type';
import { generatePieces } from 'front/utils/piece-generation.utils';
import { getNextPiece } from 'front/utils/piece.utils';
import { CellType } from 'front/types/tetrominoes.type';
import { PIECES_BUFFER_SIZE } from 'front/utils/game.utils'

describe('generatePieces', () => {
    const mockPiece = {
        type: CellType.I,
        position: { x: 3, y: -1 },
        rotationState: 0,
    };

    const mockRNG = vi.fn();
    mockRNG.mockReturnValue(0.5);

    beforeEach(() => {
        vi.mock('front/utils/piece.utils', () => ({
            getNextPiece: vi.fn()
        }));;
    });

    it('Should generate random pieces with an offset and no skipPieceGeneration', () => {
        const gameState = {
            playerGame: {
                currentPieceIndex: 2
            },
            skipPieceGeneration: 0,
            pieces: new Array(PIECES_BUFFER_SIZE).fill(null),
            rng: mockRNG
        };
        (getNextPiece as Mock).mockReturnValue(mockPiece)
        const offset = 1;
        const count = 3;
        generatePieces(gameState, count, offset)
        const startIndex = (gameState.playerGame.currentPieceIndex % PIECES_BUFFER_SIZE) + offset;
        for (let i = 0; i < count; i++) {
            expect(gameState.pieces[startIndex + i]).toEqual(mockPiece)
        }
    })
    it('Should generate random pieces with no offset and a skipPieceGeneration', () => {
        const gameState ={
        playerGame: {
            currentPieceIndex: 0
        },
        skipPieceGeneration: 2,
        pieces: new Array(PIECES_BUFFER_SIZE).fill(null),
        rng: mockRNG
    };
        (getNextPiece as Mock).mockReturnValue(mockPiece)
        const offset = 0;
        const count = 3;
        generatePieces(gameState, count, offset)
        expect(gameState.pieces[0]).toBeNull();
        expect(gameState.pieces[1]).toBeNull();
        expect(gameState.pieces[2]).toEqual(mockPiece)
    })
    it('Should generate random pieces with a skipPieceGeneration and a same count', () => {
        const gameState = {
            playerGame: {
                currentPieceIndex: 2
            },
            skipPieceGeneration: 3,
            pieces: new Array(PIECES_BUFFER_SIZE).fill(null),
            rng: mockRNG
        };
        (getNextPiece as Mock).mockReturnValue(mockPiece);
        const offset = 0;
        const count = 3;
        generatePieces(gameState, count, offset);
        expect(gameState.pieces[0]).toBeNull();
        expect(gameState.pieces[1]).toBeNull();
        expect(gameState.pieces[2]).toBeNull();
    })
})