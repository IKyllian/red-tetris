import { createSlice } from '@reduxjs/toolkit'

interface SocketState {
    isConnected: boolean;
}
const defaultSocket: SocketState = {
    isConnected: false
};

export const socketSlice = createSlice({
    name: 'socket',
    initialState: defaultSocket,
    reducers: {
        initSocket: () => {},
        connectionEstablished: (state) => {
            state.isConnected = true;
        },
        connectionLost: (state) => {
            state.isConnected = false;
        },
    }
})

export const { initSocket, connectionEstablished, connectionLost } = socketSlice.actions

export default socketSlice.reducer