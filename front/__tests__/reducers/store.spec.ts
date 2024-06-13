import { configureStore } from '@reduxjs/toolkit';
import { describe, beforeEach, it, expect } from "vitest";
import PlayerReducer from 'front/store/player.slice';
import SocketReducer from 'front/store/socket.slice';
import socketMiddleware from 'front/store/socketMiddleware';
import LobbyReducer from 'front/store/lobby.slice';
import GameReducer from 'front/store/game.slice';
import inputMiddleware from 'front/store/inputMiddleware';
import type { RootState, AppDispatch } from 'front/store/store'
 
describe("Redux Store", () => {
    let testStore: ReturnType<typeof configureStore>;
    beforeEach(() => {
        testStore = configureStore({
          reducer: {
            player: PlayerReducer,
            socket: SocketReducer,
            lobby: LobbyReducer,
            game: GameReducer,
          },
          middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({ serializableCheck: false }).concat(
              socketMiddleware,
              inputMiddleware
            ),
          devTools: true,
        });
    });
    it('should have the correct initial state', () => {
        const state: RootState = testStore.getState();
        expect(state.player).toEqual(PlayerReducer(undefined, { type: '@@INIT' }));
        expect(state.socket).toEqual(SocketReducer(undefined, { type: '@@INIT' }));
        expect(state.lobby).toEqual(LobbyReducer(undefined, { type: '@@INIT' }));
        expect(state.game).toEqual(GameReducer(undefined, { type: '@@INIT'  }));
    });

    it('should dispatch actions and update the state', () => {
      const initialState: RootState = testStore.getState();
      const player = {name: "test", id: "qwe"}
      const action = { type: 'player/createPlayer', payload: player };
      testStore.dispatch(action);
      const updatedState: RootState = testStore.getState();
      expect(updatedState.player).not.toEqual(initialState.player);
    });
  
    it('should include custom middleware', () => {
      const middlewares = testStore.middleware;
      expect(middlewares).toContain(socketMiddleware);
      expect(middlewares).toContain(inputMiddleware);
    });
  
    // it('should disable serializable check in middleware', () => {
    //   const middleware = testStore.middleware;
    //   const serializableCheck = middleware.find((mw: any) => mw.name === 'serializableCheckMiddleware');
    //   expect(serializableCheck).toBeUndefined();
    // });
})