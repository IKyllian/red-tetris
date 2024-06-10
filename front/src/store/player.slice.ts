import { createSlice } from '@reduxjs/toolkit'
import { RootState } from 'front/store/store';
import { IPlayer } from 'front/types/player.type';

// const defaultPlayer: IPlayer = {
//     name: null,
//     id: null,
//     isLeader: false
// };

const defaultPlayer = null as IPlayer | null

export const playerSlice = createSlice({
    name: 'player',
    initialState: defaultPlayer,
    reducers: {
        sign: (_, __) => {},
        createPlayer: (_, action) => {
            console.log(action.payload)
            const { name, id } = action.payload;
            // Object.assign(state, { name, id });
            // console.log("PLayer = ", state)
            return { name, id, isLeader: false }
        }
    }
})

export const { sign, createPlayer } = playerSlice.actions

export default playerSlice.reducer