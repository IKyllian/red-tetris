import { configureStore, createSlice, createAction } from '@reduxjs/toolkit';
import { beforeEach, describe, vi, it, expect } from 'vitest'
import socketMiddleware, { SocketEvent } from 'front/store/socketMiddleware';
import { io } from 'socket.io-client';
import {
	initSocket,
} from 'front/store/socket.slice';
import { IInputsPacket } from 'front/types/packet.types';

// Mock actions
const createPlayer = createAction<{ name: String, id: String }>('player/createPlayer');
const createLobby = createAction<{lobbyName: string}>('lobby/createLobby');
const joinLobby = createAction<{lobbyId: string, playerName: string}>('lobby/joinLobby');
const leaveLobby = createAction<string>('lobby/leaveLobby');
const sendStartGame = createAction('lobby/sendStartGame');
const sendInputs = createAction<IInputsPacket>('game/sendInputs');

// TODO: use mock of socket factory ?
vi.mock('socket.io-client', () => ({
    io: vi.fn(() => mockSocket)
}));

const mockSocket = {
    on: vi.fn(),
    emit: vi.fn(),
}

const testReducer = createSlice({
    name: 'test',
    initialState: {},
    reducers: {
      testAction: (state, action) => ({...state, ...action.payload})
    }
}).reducer;

describe('socket middleware', () => {
    let store;

    beforeEach(() => {
      store = configureStore({
        reducer: testReducer,
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().concat(socketMiddleware),
      });
  
      // Reset mocks before each test
      mockSocket.on.mockReset();
      mockSocket.emit.mockReset();
    });
    it('should initialize socket and set up listeners on initSocket action', () => {
        store.dispatch(initSocket());
    
        expect(io).toHaveBeenCalledWith('http://localhost:3000'); // Ensure socket.io-client is initialized with correct endpoint
        expect(mockSocket.on).toHaveBeenCalledWith(SocketEvent.Connect , expect.any(Function)); // Ensure socket event listeners are set up
        expect(mockSocket.on).toHaveBeenCalledWith(SocketEvent.Error, expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith(SocketEvent.Disconnect, expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith(SocketEvent.UpdateLobby, expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith(SocketEvent.GamesUpdate, expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith(SocketEvent.GameOver, expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith(SocketEvent.StartingGame, expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith(SocketEvent.IndestructibleLine, expect.any(Function));
    });

    it('should handle sign action and dispatch createPlayer', () => {
        const dispatch = vi.fn()
        const payload = { name: 'test', id: "K3ako" };
        dispatch(createPlayer(payload));
        
        expect(dispatch).toHaveBeenCalledWith({payload, type: "player/createPlayer"});
    });

    it('should handle createLobby action and emit CreateLobby', () => {
        const payload = { lobbyName: 'NewLobby' };
        store.dispatch(initSocket());
        store.dispatch(createLobby(payload));

        expect(mockSocket.emit).toHaveBeenCalledWith(SocketEvent.CreateLobby, { data: payload });
    });

    it('should handle joinLobby action and emit JoinLobby', () => {
        const payload = { lobbyId: 'fAZ4', playerName: 'Test' };
        store.dispatch(initSocket());
        store.dispatch(joinLobby(payload));

        expect(mockSocket.emit).toHaveBeenCalledWith(SocketEvent.JoinLobby, { data: payload });
    });

    it('should handle leaveLobby action and emit LeaveLobby', () => {
        const payload = 'fAZ4';
        store.dispatch(initSocket());
        store.dispatch(leaveLobby(payload));

        expect(mockSocket.emit).toHaveBeenCalledWith(SocketEvent.LeaveLobby, payload);
    });

    it('should handle sendStartGame action and emit StartGame', () => {
        store.dispatch(initSocket());
        store.dispatch(sendStartGame());

        expect(mockSocket.emit).toHaveBeenCalledWith(SocketEvent.StartGame);
    });

    it('should handle sendInputs action and emit CommandPressed', () => {
        const payload = {
            tick: '32',
            adjustmentIteration: '0',
            inputs: []
        }
        store.dispatch(initSocket());
        store.dispatch(sendInputs(payload));

        expect(mockSocket.emit).toHaveBeenCalledWith(SocketEvent.CommandPressed, { data: payload });
    });
})