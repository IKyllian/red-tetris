import { createSlice } from '@reduxjs/toolkit'
interface ITick {
    tick: number;
    lastUpdate: number | undefined;
    gameInterval: number;
    tickToMoveDown: number;
}

const defaultTickState: ITick = {
    tick: 0,
    lastUpdate: undefined,
    gameInterval: 0,
    tickToMoveDown: 0,
};

export const tickSlice = createSlice({
    name: 'tick',
    initialState: defaultTickState,
    reducers: {
        setTickToMoveDown: (state) => {
            state.tickToMoveDown += 1;
        },
        setTick: (state) => {
            state.tick += 1;
        },
        initLastUpdate: (state) => {
            if (state.lastUpdate === undefined) {
                state.lastUpdate = performance.now();
            }
        },
        setLastUpdate: (state, action) => {
            console.log("setLastUpdate = ", action.payload)
            state.lastUpdate = action.payload;
            console.log("STATE = ", state.lastUpdate)
        },
        setGameInterval: (state, action) => {
            state.gameInterval = action.payload;
        }
    }
})

export const { setTickToMoveDown, setTick, initLastUpdate, setLastUpdate, setGameInterval } = tickSlice.actions

export default tickSlice.reducer