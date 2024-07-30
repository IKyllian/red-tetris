
import { describe, it, vi, expect, beforeEach, Mock } from 'vitest';
import { IPlayer } from 'front/types/player.type';
import { fireEvent, render } from '@testing-library/react';
import GameModal from 'front/components/game/game-modal';
import { GameMode } from "front/types/packet.types";
import { ILobby } from 'front/types/lobby.type';
import React from 'react'
import { useAppDispatch, useAppSelector } from "front/store/hook";
import { useNavigate } from "react-router-dom";
import { resetLobby } from 'front/store/lobby.slice';
import { sendStartGame } from 'front/store/lobby.slice';

vi.mock('front/store/hook', () => ({
    useAppSelector: vi.fn(),
    useAppDispatch: vi.fn()
}));
  
// Mock the useNavigate hook
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn()
}));

describe('Game Modal', () => {
    const leaderboard: IPlayer[] = [
        {
            name: 'Joe',
            id: 'qwe',
            isLeader: true
        },
        {
            name: 'Test',
            id: 'asdasd',
            isLeader: false
        }
    ]

    const mockState = {
        player: {
            name: 'Joe',
            id: 'qwe'
        },
        game: {
            playerGame: {
                score: 7777
            }
        }
    };

    const lobby: ILobby = {
            name: 'Test',
            id: 'WaseW',
            players: [
                {
                    name: 'Joe',
                    id: 'qwe',
                    isLeader: true
                },
                {
                    name: 'Test',
                    id: 'asdasd',
                    isLeader: false
                }
            ],
            gameStarted: false,
            maxPlayers: 10,
            leaderboard: []
    }

    const mockNavigate = vi.fn();
    const mockDispatch = vi.fn();

    beforeEach(() => {
        (useAppSelector as Mock).mockImplementation((selector) => selector(mockState));
        (useNavigate as Mock).mockReturnValue(mockNavigate);
        (useAppDispatch as Mock).mockReturnValue(mockDispatch);
        vi.clearAllMocks();
    });

    it('should display the game modal in solo mode', async () => {
        const { findByTestId } = render(<GameModal gameMode={GameMode.SOLO} lobby={{gameStarted: true}} />);
        const soloScore = await findByTestId('solo-score');
        const buttonsContainer = await findByTestId('buttons-container');
        const leaveButton = await findByTestId('leave-button');
        const playAgainButton = await findByTestId('play-again-button');

        expect(soloScore).toHaveTextContent(mockState.game.playerGame.score);
        expect(buttonsContainer.children[0]).contain(leaveButton);
        expect(buttonsContainer.children[1]).contain(playAgainButton);

        fireEvent.click(leaveButton);
        expect(mockDispatch).toHaveBeenCalledWith(resetLobby())
        expect(mockNavigate).toHaveBeenCalledWith('/home')

        fireEvent.click(playAgainButton);
        expect(mockDispatch).toHaveBeenCalledWith(sendStartGame({playerName: mockState.player.name}))

    })
    it('should display the game modal in multiplayer mode with user leader', async () => {
        const { findByTestId } = render(<GameModal gameMode={GameMode.BATTLEROYAL} lobby={lobby} />);
        const buttonsContainer = await findByTestId('buttons-container');
        const leaveButton = await findByTestId('leave-button');
        const playAgainButton = await findByTestId('play-again-button');
        const leaderboard = await findByTestId('game-ranking');
        const gameModalContainer = await findByTestId('game-modal-container');

        expect(gameModalContainer.children[0]).contain(leaderboard)
        expect(buttonsContainer.children[0]).contain(leaveButton);
        expect(buttonsContainer.children[1]).contain(playAgainButton);
        fireEvent.click(leaveButton);
        expect(mockNavigate).toHaveBeenCalledWith('/lobby')

        fireEvent.click(playAgainButton);
        expect(mockDispatch).toHaveBeenCalledWith(sendStartGame({playerName: mockState.player.name}))
    })

    it('should display the game modal in multiplayer mode with user not leader', async () => {
        const lobby: ILobby = {
            name: 'Test',
            id: 'WaseW',
            players: [
                {
                    name: 'Joe',
                    id: 'qwe',
                    isLeader: false
                },
                {
                    name: 'Test',
                    id: 'asdasd',
                    isLeader: true
                }
            ],
            gameStarted: false,
            maxPlayers: 10,
            leaderboard: []
        }
        const { findByTestId } = render(<GameModal gameMode={GameMode.BATTLEROYAL} lobby={lobby} />);
        const buttonsContainer = await findByTestId('buttons-container');
        const leaveButton = await findByTestId('leave-button');
        const waitingText = await findByTestId('waiting-text');
        const leaderboard = await findByTestId('game-ranking');
        const gameModalContainer = await findByTestId('game-modal-container');

        expect(gameModalContainer.children[0]).contain(leaderboard)
        expect(buttonsContainer.children[0]).contain(leaveButton);
        expect(buttonsContainer.children[1]).contain(waitingText);

        fireEvent.click(leaveButton);
        expect(mockNavigate).toHaveBeenCalledWith('/lobby')
    })
})