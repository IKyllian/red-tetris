import { createSlice } from '@reduxjs/toolkit'
import { RootState } from './store';
import { IPlayer } from '../types/player-type';

const defaultPlayer: IPlayer = {
    name: null
};

export const playerSlice = createSlice({
    name: 'player',
    initialState: defaultPlayer,
    reducers: {
        setName: (state, action) => {
            state.name = action.payload;
        }
    }
})

export const { setName } = playerSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState) => state.counter.value

export default playerSlice.reducer