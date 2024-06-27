import { describe, it, vi, expect, beforeEach, Mock } from 'vitest';
import React from 'react'
import { fireEvent, render } from '@testing-library/react';
import Home, { CreateGameButton, JoinGameButton, GAME_MODE } from 'front/components/home/home';
import { useAppDispatch, useAppSelector } from "front/store/hook";
import { useNavigate } from "react-router-dom";
import { createLobby, joinLobby, sendStartGame } from 'front/store/lobby.slice';
import { useForm } from "react-hook-form";

vi.mock('front/store/hook', () => ({
    useAppSelector: vi.fn(),
    useAppDispatch: vi.fn()
}));
  
// Mock the useNavigate hook
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn()
}));

vi.mock('react-hook-form', () => ({
    useForm: vi.fn()
}));

describe('Home', () => {

    const mockNavigate = vi.fn();
    const mockDispatch = vi.fn();
    const mockState = {
        player: {
            name: 'Joe',
            id: 'qwe'
        },
        lobby: null
    };

    beforeEach(() => {
        (useAppSelector as Mock).mockImplementation((selector) => selector(mockState));
        (useNavigate as Mock).mockReturnValue(mockNavigate);
        (useAppDispatch as Mock).mockReturnValue(mockDispatch);
    });

    describe('Create Game Form', () => {
        const mockHandleSubmit = vi.fn((fn) => (e) => { e.preventDefault(); fn({ lobbyName: 'TestLobby' }); });
        beforeEach(() => {
            (useForm as Mock).mockReturnValue({
                register: vi.fn(),
                handleSubmit: mockHandleSubmit,
                formState: { errors: {} }
              });
        });

        it('Should render create game form without error', async () => {
            const name = 'TestLobby'
            const { findByTestId, getByPlaceholderText } = render(<CreateGameButton playerName={mockState.player.name}  />)

            const input = getByPlaceholderText('Name');
            const createGameButton = await findByTestId('form-button');
            const form = await findByTestId('form');

            expect(form.children).toHaveLength(2)
            fireEvent.change(input, { target: { value: name } });
            fireEvent.submit(createGameButton)

            expect(mockDispatch).toHaveBeenCalledWith(createLobby({
                playerName: mockState.player.name,
                name
            }))
        })

        it('Should render create game form with error', async () => {
            const message = 'Lobby name is required';
            (useForm as Mock).mockReturnValue({
                register: vi.fn(),
                handleSubmit: mockHandleSubmit,
                formState: { errors: { lobbyName: { message } } }
            });
            const { findByTestId } = render(<CreateGameButton playerName={mockState.player.name}  />)

            const form = await findByTestId('form');
            const error = await findByTestId('form-error');
            
            expect(form.children).toHaveLength(3)
            expect(error).toHaveTextContent(message)
        })
    })
    
    describe('Join Game Form', () => {
        const mockHandleSubmit = vi.fn((fn) => (e) => { e.preventDefault(); fn({ lobbyId: 'TestLobby' }); });
        beforeEach(() => {
            (useForm as Mock).mockReturnValue({
                register: vi.fn(),
                handleSubmit: mockHandleSubmit,
                formState: { errors: {} }
              });
        });
        it('Should render join game form without error', async () => {
            const lobbyId = 'TestLobby'
            const { findByTestId, getByPlaceholderText } = render(<JoinGameButton playerName={mockState.player.name}  />)

            const input = getByPlaceholderText('Game Id');
            const joinGameButton = await findByTestId('form-button');
            const form = await findByTestId('form');

            expect(form.children).toHaveLength(2)
            fireEvent.change(input, { target: { value: lobbyId } });
            fireEvent.submit(joinGameButton)

            expect(mockDispatch).toHaveBeenCalledWith(joinLobby({
                playerName: mockState.player.name,
                lobbyId
            }))
        })

        it('Should render join game form with error', async () => {
            const message = 'Lobby id is required';
            (useForm as Mock).mockReturnValue({
                register: vi.fn(),
                handleSubmit: mockHandleSubmit,
                formState: { errors: { lobbyId: { message } } }
            });
            const { findByTestId } = render(<JoinGameButton playerName={mockState.player.name}  />)

            const form = await findByTestId('form');
            const error = await findByTestId('form-error');
            
            expect(form.children).toHaveLength(3)
            expect(error).toHaveTextContent(message)
        })
    })

    describe('Home', () => {
        it('Should render Home', async () => {
            const { findAllByTestId } = render(<Home />)

            const gameModes = await findAllByTestId('tetris-letter');

            expect(gameModes).toHaveLength(3)
            
            fireEvent.click(gameModes[0])
            expect(mockDispatch).toHaveBeenCalledWith(sendStartGame({
                playerName: mockState.player.name,
            }))
            expect(gameModes[0]).toHaveTextContent(GAME_MODE[0].title)
            expect(gameModes[0]).toHaveTextContent(GAME_MODE[0].description)
            expect(gameModes[0]).toHaveStyle({
                backgroundColor: GAME_MODE[0].color,
                color: GAME_MODE[0].textColor,
                border: "1px solid " + GAME_MODE[0].textColor,
            })

            fireEvent.click(gameModes[1])
            expect(mockNavigate).toHaveBeenCalledWith(GAME_MODE[1].path)
            expect(gameModes[1]).toHaveTextContent(GAME_MODE[1].title)
            expect(gameModes[1]).toHaveTextContent(GAME_MODE[1].description)
            expect(gameModes[1]).toHaveStyle({
                backgroundColor: GAME_MODE[1].color,
                color: GAME_MODE[1].textColor,
                border: "1px solid " + GAME_MODE[1].textColor,
            })

            fireEvent.click(gameModes[2])
            expect(mockNavigate).toHaveBeenCalledWith(GAME_MODE[2].path)
            expect(gameModes[2]).toHaveTextContent(GAME_MODE[2].title)
            expect(gameModes[2]).toHaveTextContent(GAME_MODE[2].description)
            expect(gameModes[2]).toHaveStyle({
                backgroundColor: GAME_MODE[2].color,
                color: GAME_MODE[2].textColor,
                border: "1px solid " + GAME_MODE[2].textColor,
            })
        })
        it('should navigate to game because game started', () => {
            (useAppSelector as Mock).mockImplementation((selector) => selector({...mockState, lobby: {gameStarted: true}}));
            render(<Home />)
            expect(mockNavigate).toHaveBeenCalledWith('/game')
        })
        it('should navigate to lobby because user is in lobby', () => {
            (useAppSelector as Mock).mockImplementation((selector) => selector({...mockState, lobby: {id: 'qwe'}}));
            render(<Home />)
            expect(mockNavigate).toHaveBeenCalledWith('/lobby')
        })
    })
})