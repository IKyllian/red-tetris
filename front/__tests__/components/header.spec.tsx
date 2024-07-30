import { describe, expect, it, vi, Mock, beforeEach } from "vitest";
import { render, fireEvent } from '@testing-library/react';
import Header from 'front/components/header/header';
import React from "react";
import { useAppDispatch, useAppSelector } from "front/store/hook";
import { leaveLobby } from 'front/store/lobby.slice';
import { leaveGame } from 'front/store/game.slice';
import { resetGame } from 'front/store/game.slice';

// Mock useAppSelector and useAppDispatch
vi.mock('front/store/hook', () => ({
    useAppSelector: vi.fn(),
    useAppDispatch: vi.fn()
}));

describe("Header", () => {
    const mockDispatch = vi.fn();

    beforeEach(() => {
        (useAppDispatch as Mock).mockReturnValue(mockDispatch);
        vi.clearAllMocks();
    });
    it('Should render Header when player is not connected', async () => {
        const mockState = {
            player: null,
            lobby: null
        };
        (useAppSelector as Mock).mockImplementation((selector) => selector(mockState));
        const { findAllByTestId, findByTestId } = render(
            <Header />
        )

        const logoLetters = await findAllByTestId('logo-letter');
        const headerRightContainer = await findByTestId('header-right-container');
        
        expect(headerRightContainer.children).toHaveLength(0)
        expect(logoLetters).toHaveLength(6);
        expect(mockState.player).toBeNull();
        expect(mockState.lobby).toBeNull();

    })
    it('Should render Header when player is connected and not in game', async () => {
        const mockState = {
            player: {
                name: 'Joe',
                id: 'qwe'
            },
            lobby: null
        };

        (useAppSelector as Mock).mockImplementation((selector) => selector(mockState));
        const { findAllByTestId, findByTestId } = render(
            <Header />
        )
        const logoLetters = await findAllByTestId('logo-letter');
        const playerName = await findByTestId('player-name');
        const headerRightContainer = await findByTestId('header-right-container');

        expect(headerRightContainer.children).toHaveLength(1)
        expect(logoLetters).toHaveLength(6);
        expect(playerName).toHaveTextContent(mockState.player.name)
    })
    it('Should render Header when player is connected and in game', async () => {
        const mockState = {
            player: {
                name: 'Joe',
                id: 'qwe'
            },
            lobby: {
                name: 'Test',
                id: 'WaseW',
                players: [
                    {
                        name: 'Joe',
                        id: 'qwe',
                        isLeader: true
                    }
                ],
                gameStarted: true,
                maxPlayers: 10,
                leaderboard: null
            }
        };

        (useAppSelector as Mock).mockImplementation((selector) => selector(mockState));
        const { findAllByTestId, findByTestId } = render(
            <Header />
        )
        const logoLetters = await findAllByTestId('logo-letter');
        const leaveButton = await findByTestId('leave-button');
        const playerName = await findByTestId('player-name');
        const headerRightContainer = await findByTestId('header-right-container');

        expect(headerRightContainer.children).toHaveLength(2)
        expect(logoLetters).toHaveLength(6);
        expect(playerName).toHaveTextContent(mockState.player.name)
        
        fireEvent.click(leaveButton)
        expect(mockDispatch).toHaveBeenCalledWith(leaveLobby(mockState.lobby.id))
        expect(mockDispatch).toHaveBeenCalledWith(leaveGame())
        expect(mockDispatch).toHaveBeenCalledWith(resetGame())
    })
})