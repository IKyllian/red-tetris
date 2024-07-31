import { createSlice } from '@reduxjs/toolkit'
import { IPlayer } from 'front/types/player.type';

const defaultPlayer = null as IPlayer | null

export const playerSlice = createSlice({
    name: 'player',
    initialState: defaultPlayer,
    reducers: {
        sign: (_, __) => {},
        createPlayer: (_, action) => {
            const { name, id } = action.payload;

            return { name, id, isLeader: false }
        }
    }
})

export const { sign, createPlayer } = playerSlice.actions

export default playerSlice.reducer