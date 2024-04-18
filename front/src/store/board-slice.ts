import { createSlice } from '@reduxjs/toolkit'
import { RootState } from './store';
import { IBoard, ISize } from '../types/board-types';
import { buildBoard } from '../utils/board-utils';

const defaultBoardSize: ISize = {
    columns: 10,
    rows: 20
}
const defaultBoard: IBoard = buildBoard(defaultBoardSize);

export const boardSlice = createSlice({
    name: 'board',
    initialState: defaultBoard,
    reducers: {
        
    }
})

export const {  } = boardSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState) => state.counter.value

export default boardSlice.reducer