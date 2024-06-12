import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ILobby, defaultLobby, defaultLobbyState } from 'front/types/lobby.type';
import { SocketEvent } from 'front/store/socketMiddleware';


// export const createLobby = createAsyncThunk<ILobby, { name: string, playerName: string }, { rejectValue: string }>(
// 	'lobby/createLobby',
// 	async (payload, { rejectWithValue }) => {
//     try {
//         return await new Promise((_, __) => {
// 			console.log("IN PROMISE", payload)
// 		});
//     } catch (error) {
//         return rejectWithValue(error.message);
//     }
// });

// export const leaveLobby = createAsyncThunk<ILobby, string, { rejectValue: string }>('lobby/leaveLobby', async (_, { rejectWithValue }) => {
//     try {
//         return await new Promise((_, __) => {});
//     } catch (error) {
//         return rejectWithValue(error.message);
//     }
// });

export const lobbySlice = createSlice({
	name: 'lobby',
	initialState: defaultLobbyState,
	reducers: {
		setLobby: (state, action) => {
			return { ...state, ...action.payload };
		},
		createLobby: (state, __) => {
			state.loading = true;
		},
		// leaveLobby: (_, __) => defaultLobby,
		joinLobby: (_, __) => {},
		sendStartGame: (_, __) => {},
		setGameStarted: (state, action: { payload: boolean }) => {
			state.lobby.gameStarted = action.payload;
			state.lobby.leaderboard = null;
		},
		onAllGamesOver: (state, action) => {
			state.lobby.gameStarted = false;
			state.lobby.leaderboard = action.payload;
		},
	},
	// extraReducers: (builder) => {
    //     builder
    //         .addCase(createLobby.pending, (state) => {
    //             state.loading = true;
    //         })
    //         .addCase(createLobby.fulfilled, (state, action) => {
	// 			console.log("Action fulfilled = ", action)
    //             state.loading = false;
    //             state.lobby = action.payload;
    //         })
    //         .addCase(createLobby.rejected, (state, action) => {
    //             state.loading = false;
    //             state.error = action.error.message;
    //         })
    //         .addCase(leaveLobby.pending, (state) => {
    //             state.loading = true;
    //         })
    //         .addCase(leaveLobby.fulfilled, (state) => {
    //             state.loading = false;
    //             state.lobby = null;
    //         })
    //         .addCase(leaveLobby.rejected, (state, action) => {
    //             state.loading = false;
    //             state.error = action.error.message;
    //         });
    // },
});

export const {
	setLobby,
	createLobby,
	// leaveLobby,
	joinLobby,
	setGameStarted,
	sendStartGame,
	onAllGamesOver,
} = lobbySlice.actions;

export default lobbySlice.reducer;
