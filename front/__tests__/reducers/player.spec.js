import playerReducer, { createPlayer, sign } from 'front/store/player.slice';
import { expect } from "vitest"

describe("reducer/player", () => {
    const initialState = null;
    describe('on createPlayer', () => {
        const player = {name: "test", id: "qwe"}
        it('Test action', () => {
            expect(createPlayer(player)).toEqual({
                type: 'player/createPlayer',
                payload: player
            })
        })

        it('should create a new player', () => {
            const newState = playerReducer(initialState, createPlayer(player))
            expect(newState).toEqual({...player, isLeader: false})
        })
    })
    describe('on sign', () => {
        const player = {name: "test"}
        it('Test action', () => {
            expect(sign(player)).toEqual({
                type: 'player/sign',
                payload: player
            })
        })

        it('should call sign reducer but does nothing', () => {
            const newState = playerReducer(initialState, sign(player))
            expect(newState).toBeNull()
        })
    })
})