import { describe, it, vi, Mock, beforeEach, expect } from "vitest";
import { useAppDispatch, useAppSelector } from "front/store/hook";
import { useNavigate, useParams } from "react-router-dom";
import { sign } from 'front/store/player.slice';
import { joinLobby } from 'front/store/lobby.slice';
import { render } from "@testing-library/react";
import JoinLobbyByPath from 'front/components/lobby/join-lobby-by-path';
import React from 'react'

vi.mock('front/store/hook', () => ({
    useAppDispatch: vi.fn(),
    useAppSelector: vi.fn(),
}));
  
// Mock the useNavigate hook
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
    useParams: vi.fn()
}));

describe('join lobby by path', () => {
    const mockNavigate = vi.fn();
    const mockDispatch = vi.fn();

    const mockState = {
        player: {
            name: 'Joe',
            id: 'qwe'
        },
        socket: {
            isSocketConnected: true
        }
    };
    beforeEach(() => {
        (useAppSelector as Mock).mockImplementation((selector) => selector(mockState));
        (useNavigate as Mock).mockReturnValue(mockNavigate);
        (useAppDispatch as Mock).mockReturnValue(mockDispatch);
        vi.clearAllMocks();
    });

    it('should send event to join or create lobby', () => {
        const mockParams = {
            lobbyId: 'qwea',
            playerName: 'Joe',
        };
        (useParams as Mock).mockReturnValue(mockParams);

        render(<JoinLobbyByPath />)
        expect(mockDispatch).toHaveBeenCalledWith(sign(mockParams.playerName));
        expect(mockDispatch).toHaveBeenCalledWith(joinLobby({lobbyId: mockParams.lobbyId, playerName: mockParams.playerName, createLobbyIfNotExists: true}));
    })
    it('should join the lobby', () => {
        const mockState = {
            player: {
                name: 'Joe',
                id: 'qwe'
            },
            socket: {
                isSocketConnected: true
            },
            lobby: {
                id: 'test'
            }
        };
        (useAppSelector as Mock).mockImplementation((selector) => selector(mockState));
        render(<JoinLobbyByPath />)
        expect(mockNavigate).toHaveBeenCalledWith('/lobby');
    })

    it('should not join a lobby because socket not conected', () => {
        const mockState = {
            player: {
                name: 'Joe',
                id: 'qwe'
            },
            socket: {
                isSocketConnected: false
            }
        };
        (useAppSelector as Mock).mockImplementation((selector) => selector(mockState));
        render(<JoinLobbyByPath />)
        expect(mockDispatch).not.toHaveBeenCalled();
    })
})