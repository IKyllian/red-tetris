import { createSlice } from '@reduxjs/toolkit'
import { RootState } from './store';
import { IPlayer } from '../types/player.type';

const defaultPlayer: IPlayer = {
    name: "",
    id: "",
    isLeader: false
};

export const playerSlice = createSlice({
    name: 'player',
    initialState: defaultPlayer,
    reducers: {
        setName: (_, __) => { },
        createPlayer: (state, action) => {
            console.log(action.payload)
            const { name, id } = action.payload;
            Object.assign(state, { name, id });
            console.log("PLayer = ", state)
        }
    }
})

export const { setName, createPlayer } = playerSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectPlayerName = (state: RootState) => state.player.name;

export default playerSlice.reducer