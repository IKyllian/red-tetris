import { describe, it, vi, Mock, beforeEach, expect } from "vitest";
import { useAppDispatch } from "front/store/hook";
import { useNavigate, useParams } from "react-router-dom";
import { sign } from 'front/store/player.slice';
import { joinLobby } from 'front/store/lobby.slice';
import { render } from "@testing-library/react";
import JoinLobbyByPath from 'front/components/lobby/join-lobby-by-path';
import React from 'react'

vi.mock('front/store/hook', () => ({
    useAppDispatch: vi.fn()
}));
  
// Mock the useNavigate hook
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
    useParams: vi.fn()
}));

describe('join lobby by path', () => {
    const mockNavigate = vi.fn();
    const mockDispatch = vi.fn();

    beforeEach(() => {
        (useNavigate as Mock).mockReturnValue(mockNavigate);
        (useAppDispatch as Mock).mockReturnValue(mockDispatch);
        vi.clearAllMocks();
    });

    it('should join a lobby', () => {
        const mockParams = {
            lobbyId: 'qwea',
            playerName: 'Joe'
        };
        (useParams as Mock).mockReturnValue(mockParams);

        render(<JoinLobbyByPath />)
        expect(mockDispatch).toHaveBeenCalledWith(sign(mockParams.playerName));
        expect(mockDispatch).toHaveBeenCalledWith(joinLobby({lobbyId: mockParams.lobbyId, playerName: mockParams.playerName}));
        expect(mockNavigate).toHaveBeenCalledWith('/lobby');
    })
    it('should redirect to /sign because no lobbyId', () => {
        const mockParams = {
            playerName: 'Joe'
        };
        (useParams as Mock).mockReturnValue(mockParams);

        render(<JoinLobbyByPath />)
        expect(mockNavigate).toHaveBeenCalledWith('/sign');
    })
    it('should redirect to /sign because no playerName', () => {
        const mockParams = {
            lobbyId: 'qwea'
        };
        (useParams as Mock).mockReturnValue(mockParams);

        render(<JoinLobbyByPath />)
        expect(mockNavigate).toHaveBeenCalledWith('/sign');
    })
    it('should redirect to /sign because no params', () => {
        (useParams as Mock).mockReturnValue({});

        render(<JoinLobbyByPath />)
        expect(mockNavigate).toHaveBeenCalledWith('/sign');
    })
})