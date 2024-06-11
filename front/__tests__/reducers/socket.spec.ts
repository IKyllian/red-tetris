import { describe, it, expect } from 'vitest';
import socketReducer, { initSocket, connectionEstablished, connectionLost } from 'front/store/socket.slice'

describe('reducer/socket', () => {
    const initialState = {
        isConnected: false
    }
    describe('on init socket', () => {
        it('should not update the store', () => {
            const newState = socketReducer(initialState, initSocket())
            expect(newState).toEqual(initialState)
        })    
    })
    describe('on connectionEstablished', () => {
        it('should update isConnected', () => {
            const newState = socketReducer(initialState, connectionEstablished())
            expect(newState).toEqual({isConnected: true})
        })
    })
    describe('on connectionLost', () => {
        it('should update isConnected', () => {
            const newState = socketReducer({isConnected: true}, connectionLost())
            expect(newState).toEqual(initialState)
        })
    })
})