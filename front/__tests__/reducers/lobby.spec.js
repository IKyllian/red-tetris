import lobbyReducer, { 
    setLobby,
	createLobby,
	leaveLobby,
	joinLobby,
	setGameStarted,
	sendStartGame,
	onAllGamesOver,
 } from 'front/store/lobby.slice';
import { expect, vi } from "vitest"
import { defaultLobby } from 'front/types/lobby.type';

describe("reducer/lobby", () => {
    const player = {name: "test", id: "qwe", isLeader: true}
    const initialState = defaultLobby;
    const newLobby = {
        players: [player],
        name: "test",
        id: "weo9q"
    }
    describe('on setLobby', () => {
        it('should update the lobby', () => {
            const newState = lobbyReducer(initialState, setLobby(newLobby))
            expect(newState).toEqual({...initialState, ...newLobby})
        })
    })
    describe('on setGameStarted', () => {
        it('should put gameStarted to true and leaderboard to null', () => {
            const newState = lobbyReducer(initialState, setGameStarted(true))
            expect(newState.gameStarted).toBeTruthy()
            expect(newState.leaderboard).toBeNull()
        })
    })
    describe('on leaveLobby', () => {
        it('should reset lobby to defaultLobby', () => {
            const newState = lobbyReducer({...initialState, ...newLobby}, leaveLobby())
            expect(newState).toEqual(initialState)
        })
    })
    describe('on onAllGamesOver', () => {
        it('should set gameStarted to false + receive and set leaderboard', () => {
            const newState = lobbyReducer(initialState, onAllGamesOver([player]))
            expect(newState.gameStarted).toBeFalsy()
            expect(newState.leaderboard).toEqual([player])
        })
    })
    describe('on createLobby', () => {
        it('should not update the state', () => {
            const newState = lobbyReducer(initialState, createLobby())
            expect(newState).toEqual(initialState)
        })
    })
    describe('on joinLobby', () => {
        it('should not update the state', () => {
            const newState = lobbyReducer(initialState, joinLobby())
            expect(newState).toEqual(initialState)
        })
    })
    describe('on sendStartGame', () => {
        it('should not update the state', () => {
            const newState = lobbyReducer(initialState, sendStartGame())
            expect(newState).toEqual(initialState)
        })
    })
})