import { describe, vi, expect, it, beforeEach, Mock } from 'vitest';
import React from 'react'
import { ILobby } from 'front/types/lobby.type';
import { useAppDispatch, useAppSelector } from "front/store/hook";
import { useNavigate } from "react-router-dom";
import Lobby from 'front/components/lobby/lobby';
import { render, fireEvent } from '@testing-library/react';
import { sendStartGame, leaveLobby } from 'front/store/lobby.slice';
import { resetGame } from 'front/store/game.slice';

vi.mock('front/store/hook', () => ({
    useAppSelector: vi.fn(),
    useAppDispatch: vi.fn()
}));
  
// Mock the useNavigate hook
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn()
}));

describe('Lobby', () => {
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

    const mockState = {
        player: {
            name: 'Joe',
            id: 'qwe'
        },
        lobby
    };

    const mockNavigate = vi.fn();
    const mockDispatch = vi.fn();

    beforeEach(() => {
        (useNavigate as Mock).mockReturnValue(mockNavigate);
        (useAppDispatch as Mock).mockReturnValue(mockDispatch);
        vi.clearAllMocks();
    });

    it('should display lobby component and consider player as owner', async () => {
        (useAppSelector as Mock).mockImplementation((selector) => selector(mockState));

        const { findByTestId, findAllByTestId } = render(<Lobby />)

        const playerItems = await findAllByTestId('player-item')
        const pageTitle = await findByTestId('page-title')
        const buttonsContainer = await findByTestId('buttons-container')
        const startButton = await findByTestId('start-button')
        const leaveButton = await findByTestId('leave-button')

        expect(playerItems).toHaveLength(2)
        expect(pageTitle).toHaveTextContent(mockState.lobby.name)
        expect(pageTitle).toHaveTextContent(mockState.lobby.id)
        expect(buttonsContainer.children).toHaveLength(2)
        expect(buttonsContainer.children[0]).contain(startButton)
        expect(buttonsContainer.children[1]).contain(leaveButton)

        fireEvent.click(startButton)
        expect(mockDispatch).toHaveBeenCalledWith(sendStartGame({
            playerName: mockState.player.name
        }))

        fireEvent.click(leaveButton)
        expect(mockDispatch).toHaveBeenCalledWith(leaveLobby(mockState.lobby.id))
        expect(mockDispatch).toHaveBeenCalledWith(resetGame())
    })

    it('should display lobby component and not consider player as owner', async () => {
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

        const mockState = {
            player: {
                name: 'Joe',
                id: 'qwe'
            },
            lobby
        };
        (useAppSelector as Mock).mockImplementation((selector) => selector(mockState));


        const { findByTestId } = render(<Lobby />)

        const buttonsContainer = await findByTestId('buttons-container')
        const leaveButton = await findByTestId('leave-button')

        expect(buttonsContainer.children).toHaveLength(1)
        expect(buttonsContainer.children[0]).contain(leaveButton)

        fireEvent.click(leaveButton)
        expect(mockDispatch).toHaveBeenCalledWith(leaveLobby(mockState.lobby.id))
        expect(mockDispatch).toHaveBeenCalledWith(resetGame())
    })

    it('should redirect to home because no lobby', async () => {
        const mockState = {
            player: {
                name: 'Joe',
                id: 'qwe'
            },
            lobby: null
        };
        (useAppSelector as Mock).mockImplementation((selector) => selector(mockState));

        render(<Lobby />)
        expect(mockNavigate).toHaveBeenCalledWith('/home')
    })
    it('should redirect to game because the lobby is in game', async () => {
        (useAppSelector as Mock).mockImplementation((selector) => selector({...mockState, lobby: {...mockState.lobby, gameStarted: true}}));
        
        render(<Lobby />)
        expect(mockNavigate).toHaveBeenCalledWith('/game')
    })
})