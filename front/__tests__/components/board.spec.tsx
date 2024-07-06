import { describe, it, vi, Mock, expect, beforeEach } from "vitest";
import { useAppSelector } from "front/store/hook";
import React from 'react';
import Board from 'front/components/board/board';
import { render } from "@testing-library/react";
import { GameMode } from "front/types/packet.types";
import { TetriminosArray } from "front/types/tetrominoes.type";
import { getBoardStyleSize, getPiecePreviewSize } from 'front/utils/board-size-display.utils';

vi.mock('front/store/hook', () => ({
    useAppSelector: vi.fn(),
}));

vi.mock('front/utils/board-size-display.utils', () => {
    const mockGetBoardStyleSize = vi.fn(() => ({ width: 100, height: 200 }));
    const mockGetPiecePreviewSize = vi.fn(() => ({ width: 50, height: 50 }));

    return {
        getBoardStyleSize: mockGetBoardStyleSize,
        getPiecePreviewSize: mockGetPiecePreviewSize,
    };
});

describe('Board Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockBoard = {
        size: { rows: 20, columns: 10 },
        cells: Array(20).fill(Array(10).fill({ type: null, isPreview: false })),
    };
    
    const mockState = {
        player: {
            name: 'Joe',
            id: 'qwe'
        },
        game: {
            playerGame: {
                score: 3210,
                level: 3
            },
            countdown: -1
        }
    }

    const nextPieces = TetriminosArray.slice(0, 3)

    it('should render the board on solo mode without countdown', async () => {
        (useAppSelector as Mock).mockImplementation((selector) => selector(mockState));
        const boardSize = getBoardStyleSize(false, 0)

        const boardStyles = {
            gridTemplateRows: `repeat(${mockBoard.size.rows}, 1fr)`,
            gridTemplateColumns: `repeat(${mockBoard.size.columns}, 1fr)`,
            width: `${boardSize.width}px`,
            height: `${boardSize.height}px`,
            minWidth: "73px",
            minHeight: "156px",
        };
        const { findByTestId, getByText, findAllByTestId, queryByTestId } = render(
            <Board
                board={mockBoard}
                playerName={mockState.player.name}
                isGameOver={false}
                nextPieces={nextPieces}
                isOpponentBoards={false}
                opponentsLength={0}
                gameMode={GameMode.SOLO}
            />
        )

        const scoreContainer = await findByTestId('score-container')
        const board = await findByTestId('board')
        const cells = await findAllByTestId('cell-item')
        const boardsPreview = await findAllByTestId('board-preview')

        expect(scoreContainer).toHaveTextContent(mockState.game.playerGame.score)
        expect(scoreContainer).toHaveTextContent(mockState.game.playerGame.level)
        expect(board).toHaveStyle(boardStyles)
        expect(getByText(mockState.player.name)).toBeInTheDocument()
        expect(cells).toHaveLength(mockBoard.size.rows * mockBoard.size.columns)
        expect(boardsPreview).toHaveLength(nextPieces.length)
        expect(queryByTestId('countdown')).toBeNull();
    })
    it('should render the board on solo mode with countdown to 3', async () => {
        const state = {...mockState, game: {...mockState.game, countdown: 3}};
        (useAppSelector as Mock).mockImplementation((selector) => selector(state));

        const { findByTestId } = render(
            <Board
                board={mockBoard}
                playerName={state.player.name}
                isGameOver={false}
                nextPieces={nextPieces}
                isOpponentBoards={false}
                opponentsLength={0}
                gameMode={GameMode.SOLO}
            />
        )

        const countdown = await findByTestId('countdown')
        console.log(countdown)
        expect(countdown).toHaveTextContent(`${state.game.countdown}`)
    })
    it('should render the board on solo mode with countdown to 0', async () => {
        const state = {...mockState, game: {...mockState.game, countdown: 0}};
        (useAppSelector as Mock).mockImplementation((selector) => selector(state));

        const { findByTestId } = render(
            <Board
                board={mockBoard}
                playerName={state.player.name}
                isGameOver={false}
                nextPieces={nextPieces}
                isOpponentBoards={false}
                opponentsLength={0}
                gameMode={GameMode.SOLO}
            />
        )
        const countdown = await findByTestId('countdown')
        expect(countdown).toHaveTextContent('GO')
    })
    it('should render the board on multi mode (isOpponentBoards: false)', async () => {
        (useAppSelector as Mock).mockImplementation((selector) => selector(mockState));

        const { queryByTestId } = render(
            <Board
                board={mockBoard}
                playerName={mockState.player.name}
                isGameOver={false}
                nextPieces={nextPieces}
                isOpponentBoards={false}
                opponentsLength={0}
                gameMode={GameMode.BATTLEROYAL}
            />
        )
        expect(queryByTestId('score-container')).toBeNull();
    })
    it('should render the board on multi mode (isOpponentBoards: true)', async () => {
        (useAppSelector as Mock).mockImplementation((selector) => selector(mockState));

        const { queryByTestId } = render(
            <Board
                board={mockBoard}
                playerName={mockState.player.name}
                isGameOver={false}
                nextPieces={nextPieces}
                isOpponentBoards={true}
                opponentsLength={3}
                gameMode={GameMode.BATTLEROYAL}
            />
        )
        expect(queryByTestId('score-container')).toBeNull();
        expect(queryByTestId('countdown')).toBeNull();
        expect(queryByTestId('next-pieces-container')).toBeNull();
    })
    it('should render the board on solo without next pieces', async () => {
        (useAppSelector as Mock).mockImplementation((selector) => selector(mockState));

        const { queryByTestId } = render(
            <Board
                board={mockBoard}
                playerName={mockState.player.name}
                isGameOver={false}
                nextPieces={[]}
                isOpponentBoards={false}
                opponentsLength={3}
                gameMode={GameMode.BATTLEROYAL}
            />
        )
        expect(queryByTestId('next-pieces-container')).toBeNull();
    })
    it('should display game over when gameOver is true', async () => {
        (useAppSelector as Mock).mockImplementation((selector) => selector(mockState));

        const { queryByTestId } = render(
            <Board
                board={mockBoard}
                playerName={mockState.player.name}
                isGameOver={true}
                nextPieces={[]}
                isOpponentBoards={true}
                opponentsLength={3}
                gameMode={GameMode.BATTLEROYAL}
            />
        )
        expect(queryByTestId('gameOver')).toBeDefined();
    })
    it('handles window resize event', () => {    
        render(
          <Board
            board={mockBoard}
            playerName="Player1"
            isGameOver={false}
            nextPieces={[]}
            isOpponentBoards={false}
            gameMode="SOLO"
          />
        );
    
        // Simulate the window resize event
        global.dispatchEvent(new Event('resize'));
    
        // Check if the mock functions were called
        expect(getBoardStyleSize).toHaveBeenCalled();
        expect(getPiecePreviewSize).toHaveBeenCalled();
      });
})