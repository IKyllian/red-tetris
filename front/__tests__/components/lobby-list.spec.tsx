import { describe, expect, afterEach, test, it, vi, Mock, beforeEach } from "vitest";
import { render, cleanup, screen, waitFor, findByTestId, fireEvent } from '@testing-library/react';
import React from "react";
import { createFetchResponse } from "../fetch-utils";
import { ILobby } from 'front/types/lobby.type';
import LobbyList from 'front/components/lobby-list/lobby-list';
import { getLobbyList } from 'front/api/lobby.api';
import { useAppDispatch, useAppSelector } from "front/store/hook";
import { useNavigate } from "react-router-dom";
import { joinLobby } from 'front/store/lobby.slice';

// Mock useAppSelector and useAppDispatch
vi.mock('front/store/hook', () => ({
    useAppSelector: vi.fn(),
    useAppDispatch: vi.fn()
}));
  
// Mock the useNavigate hook
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn()
}));

describe("Looby-list", () => {
    const lobbyList: ILobby[] = [
        {
            name: 'Test',
            id: 'WaseW',
            players: [
                {
                    name: 'PlayerTest',
                    id: 'qwe',
                    isLeader: true
                }
            ],
            gameStarted: false,
            maxPlayers: 10,
            leaderboard: null
        }
    ]

    const mockState = {
        player: {
            name: 'Joe',
            id: 'qwe'
        },
        lobby: null
    };

    const mockNavigate = vi.fn();
    const mockDispatch = vi.fn();

    global.fetch = vi.fn() as Mock

    beforeEach(() => {
        (useAppSelector as Mock).mockImplementation((selector) => selector(mockState));
        (useNavigate as Mock).mockReturnValue(mockNavigate);
        (useAppDispatch as Mock).mockReturnValue(mockDispatch);
        vi.clearAllMocks();
    });
    
    it('Should render Lobby list component with 1 lobby joinable', async () => {
        (fetch as Mock).mockResolvedValue(createFetchResponse<ILobby[]>(lobbyList))
        const lobbyListData = await getLobbyList() as ILobby[]
        
        await waitFor(() => expect(fetch).toHaveBeenCalledWith("http://localhost:3000/lobby", { method: "GET" }));
        expect(lobbyListData).toStrictEqual(lobbyList)

        const { findAllByTestId } = render(
            <LobbyList />
        )

        const lobbyItems = await findAllByTestId('lobby-list-item');
        expect(lobbyItems).toHaveLength(1);
        if (lobbyItems[0] && lobbyListData[0]) {
            const item = lobbyItems[0];
            const lobby = lobbyListData[0]
            expect(item).toHaveTextContent(lobby.name);
            expect(item).toHaveTextContent('In lobby');
            expect(item).toHaveTextContent('PlayerTest');
            expect(item).toHaveTextContent(`${lobby.players.length}/${lobby.maxPlayers}`);
            expect(item).toHaveStyle('cursor: pointer')

            fireEvent.click(item);
            expect(mockDispatch).toHaveBeenCalledWith(joinLobby({
                lobbyId: lobby.id,
				playerName: mockState.player.name
            }))
        }
    })
    it('Should render Lobby list component with 1 lobby not joinable', async () => {
        const lobbyStarted: ILobby[] = [
            {
                name: 'Test',
                id: 'WaseW',
                players: [
                    {
                        name: 'PlayerTest',
                        id: 'qwe',
                        isLeader: true
                    }
                ],
                gameStarted: true,
                maxPlayers: 10,
                leaderboard: null
            }
        ];

        (fetch as Mock).mockResolvedValue(createFetchResponse<ILobby[]>(lobbyStarted))
        const lobbyListData = await getLobbyList() as ILobby[]
        
        await waitFor(() => expect(fetch).toHaveBeenCalledWith("http://localhost:3000/lobby", { method: "GET" }));
        expect(lobbyListData).toStrictEqual(lobbyStarted)

        const { findAllByTestId } = render(
            <LobbyList />
        )

        const lobbyItems = await findAllByTestId('lobby-list-item');
        expect(lobbyItems).toHaveLength(1);
        if (lobbyItems[0] && lobbyListData[0]) {
            const item = lobbyItems[0];
            const lobby = lobbyListData[0]
            expect(item).toHaveTextContent(lobby.name);
            expect(item).toHaveTextContent('In game');
            expect(item).toHaveTextContent('PlayerTest');
            expect(item).toHaveTextContent(`${lobby.players.length}/${lobby.maxPlayers}`);
            expect(item).toHaveStyle('cursor: default')

            fireEvent.click(item);
            expect(mockDispatch).not.toHaveBeenCalled()
        }
    })
    it('Should render text because no lobby', async () => {
        (fetch as Mock).mockResolvedValue(createFetchResponse<ILobby[]>([]))
        const lobbyListData = await getLobbyList() as ILobby[]
        
        await waitFor(() => expect(fetch).toHaveBeenCalledWith("http://localhost:3000/lobby", { method: "GET" }));
        expect(lobbyListData).toStrictEqual([])

        const { findAllByTestId } = render(
            <LobbyList />
        )

        const lobbyItems = await findAllByTestId('no-lobbies-message');
        expect(lobbyItems).toHaveLength(1);
        if (lobbyItems[0]) {
            expect(lobbyItems[0]).toHaveTextContent('No lobbies available');
        }
    })
    it('Should redirect to /lobby when player is already in a lobby', async () => {
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
                        name: 'PlayerTest',
                        id: 'qwe',
                        isLeader: true
                    }
                ],
                gameStarted: false,
                maxPlayers: 10,
                leaderboard: null
            }
        };
        (useAppSelector as Mock).mockImplementation((selector) => selector(mockState));
        render(<LobbyList />)
        expect(mockNavigate).toHaveBeenCalledWith('/lobby')
    })
})