import { createSlice } from '@reduxjs/toolkit'

interface SocketState {
    isSocketConnected: boolean;
}
const defaultSocket: SocketState = {
    isSocketConnected: false
};

export const socketSlice = createSlice({
    name: 'socket',
    initialState: defaultSocket,
    reducers: {
        initSocket: () => {},
        connectionEstablished: (state) => {
            state.isSocketConnected = true;
        },
        connectionLost: (state) => {
            state.isSocketConnected = false;
        },
    }
})

export const { initSocket, connectionEstablished, connectionLost } = socketSlice.actions

export default socketSlice.reducer