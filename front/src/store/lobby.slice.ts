import { createSlice } from '@reduxjs/toolkit'
import { defaultLobby } from '../types/lobby.type';

export const lobbySlice = createSlice({
    name: 'lobby',
    initialState: defaultLobby,
    reducers: {
        setLobby: (state, action) => {
            console.log("Lobby Before = ", state, " - ", action.payload);
            state = action.payload
            console.log("Lobby = ", state)
        },
        createLobby: (_, __) => {},
        leaveLobby: (_, __) => {},
        joinLobby: (_, __) => {},
    }
})

export const { setLobby, createLobby, leaveLobby, joinLobby } = lobbySlice.actions


export default lobbySlice.reducer