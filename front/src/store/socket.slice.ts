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
        commandPressed: (_, __) => {}
    }
})

export const { initSocket, connectionEstablished, connectionLost, commandPressed } = socketSlice.actions

export default socketSlice.reducer