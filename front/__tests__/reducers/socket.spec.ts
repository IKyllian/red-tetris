import { describe, it, expect } from 'vitest';
import socketReducer, { initSocket, connectionEstablished, connectionLost } from 'front/store/socket.slice'

describe('reducer/socket', () => {
    const initialState = {
        isSocketConnected: false
    }
    describe('on init socket', () => {
        it('should not update the store', () => {
            const newState = socketReducer(initialState, initSocket())
            expect(newState).toEqual(initialState)
        })    
    })
    describe('on connectionEstablished', () => {
        it('should update isSocketConnected', () => {
            const newState = socketReducer(initialState, connectionEstablished())
            expect(newState).toEqual({isSocketConnected: true})
        })
    })
    describe('on connectionLost', () => {
        it('should update isSocketConnected', () => {
            const newState = socketReducer({isSocketConnected: true}, connectionLost())
            expect(newState).toEqual(initialState)
        })
    })
})