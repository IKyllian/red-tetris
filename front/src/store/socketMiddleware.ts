import { Middleware } from '@reduxjs/toolkit';
import SocketFactory, { SocketInterface } from 'front/store/socketFactory';
import {
	connectionEstablished,
	connectionLost,
	initSocket,
} from 'front/store/socket.slice';
import { setBoard, setBoardListener } from 'front/store/board.slice';
import { ICell, IGame } from 'front/types/board.types';
import {
	// commandPressed,
	createLobby,
	joinLobby,
	leaveLobby,
	setLobby,
	sendStartGame,
	setGameStarted,
	// onAllGamesOver,
	// sendInputs,
} from 'front/store/lobby.slice';
import { ILobby } from 'front/types/lobby.type';
import { ITetromino } from 'front/types/tetrominoes.type';
import { createPlayer, setName } from 'front/store/player.slice';
import { IPlayer } from 'front/types/player.type';
import { IGameUpdatePacketHeader } from 'front/types/packet.types';
import { setGamesState, setTickAdjustments } from 'front/store/tick.slice';
import {
	sendInputs,
	setGameStartingState,
	updateGamesBoard,
	updateIndestructibleLines,
} from './game.slice';
import history from 'history/browser';

export enum SocketEvent {
	Connect = 'connect',
	Disconnect = 'disconnect',
	// Emit events
	CreateLobby = 'create-lobby',
	JoinLobby = 'join-lobby',
	UpdateLobby = 'update-lobby',
	LeaveLobby = 'leave-lobby',
	BoardUpdate = 'board-update',
	CommandPressed = 'command-pressed',
	StartGame = 'start-game',
	StopGame = 'stop-game',
	GamesUpdate = 'games-update',
	StartingGame = 'starting-game',
	GameOver = 'game-over',
	IndestructibleLine = 'indestructible-line',
	// On events
	Error = 'error',
	SetName = 'set-name',
}

let AZE = 0;
const socketMiddleware: Middleware = (store) => {
	let socket: SocketInterface;

	return (next) => (action) => {
		// Middleware logic for the `initSocket` action
		if (initSocket.match(action)) {
			if (!socket) {
				// Create Socket
				socket = SocketFactory.Instance();

				socket.socket.on(SocketEvent.Connect, () => {
					store.dispatch(connectionEstablished());
				});

				// handle all Error events
				socket.socket.on(SocketEvent.Error, (message) => {
					console.error(message);
				});

				// Handle disconnect event
				socket.socket.on(SocketEvent.Disconnect, (reason) => {
					console.error(reason);
					store.dispatch(connectionLost());
				});

				socket.socket.on(SocketEvent.UpdateLobby, (lobby: ILobby) => {
					console.log('Updated Lobby = ', lobby);
					store.dispatch(setLobby(lobby));
				});

				socket.socket.on(
					SocketEvent.GamesUpdate,
					(data: IGameUpdatePacketHeader) => {
						// if (AZE < 1) {
						socket.socket.emit('pong');
						store.dispatch(updateGamesBoard(data));
						// store.dispatch(
						// 	setTickAdjustments({
						// 		packet: data,
						// 		playerId: socket.socket.id,
						// 	})
						// );
						// AZE++
						// }
					}
				);

				socket.socket.on(SocketEvent.GameOver, (data: IPlayer[]) => {
					console.log('GameOver = ', data);
					// store.dispatch(onAllGamesOver(data));
				});

				socket.socket.on(
					SocketEvent.StartingGame,
					(data: {
						playerGame: IGame;
						opponentsGames: IGame[];
						seed: string;
					}) => {
						console.log('StartingGame = ', data);
						store.dispatch(setGameStarted(true));
						store.dispatch(setGameStartingState(data));
						// if (history.location.pathname !== '/game') {
						// 	history.push('/game');
						// }
					}
				);

				socket.socket.on(
					SocketEvent.IndestructibleLine,
					(nbOflines: number) => {
						store.dispatch(updateIndestructibleLines(nbOflines));
					}
				);
			}
		}

		if (setName.match(action) && socket) {
			store.dispatch(
				createPlayer({ name: action.payload, id: socket.socket.id })
			);
		}

		if (createLobby.match(action) && socket) {
			console.log('CreateLobby', action.payload);
			socket.socket.emit(SocketEvent.CreateLobby, {
				data: action.payload,
			});
		}

		if (joinLobby.match(action) && socket) {
			socket.socket.emit(SocketEvent.JoinLobby, { data: action.payload });
		}

		if (leaveLobby.match(action) && socket) {
			socket.socket.emit(SocketEvent.LeaveLobby, action.payload);
		}

		if (sendStartGame.match(action) && socket) {
			socket.socket.emit(SocketEvent.StartGame);
		}

		// Listen for board updates
		if (setBoardListener.match(action) && socket) {
			socket.socket.on(SocketEvent.BoardUpdate, (cells: ICell[][]) => {
				store.dispatch(setBoard({ cells }));
			});
		}

		// Handle the commands action
		// if (commandPressed.match(action) && socket) {
		// 	let command = { data: { ...action.payload } };
		// 	socket.socket.emit(SocketEvent.CommandPressed, command);
		// }

		if (sendInputs.match(action) && socket) {
			console.log('emit sendInputs');
			let command = { data: { ...action.payload } };
			socket.socket.emit(SocketEvent.CommandPressed, command);
		}
		next(action);
	};
};

export default socketMiddleware;
