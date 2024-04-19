import { createSlice } from '@reduxjs/toolkit'
import { RootState } from './store';
import { IBoard, defaultBoardSize } from '../types/board.types';
import { buildBoard } from '../utils/board.utils';

const defaultBoard: IBoard = buildBoard(defaultBoardSize);

export const boardSlice = createSlice({
    name: 'board',
    initialState: defaultBoard,
    reducers: {
        setBoardListener: () => {},
        setBoard: (state, action) => {
            state.cells = [...action.payload.cells];
        }
    }
})

export const { setBoardListener, setBoard } = boardSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectBoard = (state: RootState) => state.board.cells
export const selectBoardSize = (state: RootState) => state.board.size

export default boardSlice.reducer