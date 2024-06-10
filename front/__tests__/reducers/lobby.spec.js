import lobbyReducer, { 
    setLobby,
	createLobby,
	leaveLobby,
	joinLobby,
	setGameStarted,
	sendStartGame,
	onAllGamesOver,
 } from 'front/store/lobby.slice';
import { expect } from "vitest"
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
            expect(newState).toEqual({...initialState, gameStarted: true, leaderboard: null})
        })
    })
    describe('on leaveLobby', () => {
        it('should reset lobby to defaultLobby', () => {
            const newState = lobbyReducer({...initialState, ...newLobby}, leaveLobby())
            expect(newState).toEqual(initialState)
        })
    })
    describe('on createLobby', () => {
        it('should call createLobby with a name as parameter', () => {
            // expect(createLobby).toHaveBeenCalledWith({
            //     name: 'Test lobby',
            //     playerName: 'Test'
            // })
        })
    })

})