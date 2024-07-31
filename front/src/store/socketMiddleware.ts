import { Middleware } from '@reduxjs/toolkit';
import SocketFactory from 'front/store/socketFactory';
import {
	connectionEstablished,
	connectionLost,
	initSocket,
} from 'front/store/socket.slice';
import { IGame } from 'front/types/board.types';
import {
	createLobby,
	joinLobby,
	leaveLobby,
	setLobby,
	sendStartGame,
	setGameStarted,
	onAllGamesOver,
} from 'front/store/lobby.slice';
import { ILobby } from 'front/types/lobby.type';
import { createPlayer, sign } from 'front/store/player.slice';
import { IPlayer } from 'front/types/player.type';
import {
	GameMode,
	IGameUpdatePacketHeader,
	IIndestructiblePacket,
	ITickAdjustmentPacket,
} from 'front/types/packet.types';
import {
	setGameStartingState,
	updateGamesBoard,
	updateIndestructibleLines,
	updateTickAdjustments,
	leaveGame,
	gameOver,
} from './game.slice';
import { Socket } from 'socket.io-client';

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
	LeaveGame = 'leave-game',
	GameOver = 'game-over',
	IndestructibleLine = 'indestructible-line',
	SyncWithServer = 'sync',
	// On events
	Error = 'error',
	SetName = 'set-name',
}

const socketMiddleware: Middleware = (store) => {
	let socket: Socket;
	return (next) => (action) => {
		// Middleware logic for the `initSocket` action
		if (initSocket.match(action)) {
			if (!socket) {
				// Create Socket
				socket = SocketFactory.Instance();
				socket.on(SocketEvent.Connect, () => {
					store.dispatch(connectionEstablished());
				});

				// handle all Error events
				socket.on(SocketEvent.Error, (message) => {
					console.error(message);
				});

				// Handle disconnect event
				socket.on(SocketEvent.Disconnect, (reason) => {
					console.error(reason);
					store.dispatch(connectionLost());
				});

				socket.on(SocketEvent.UpdateLobby, (lobby: ILobby) => {
					store.dispatch(setLobby(lobby));
				});

				socket.on(
					SocketEvent.GamesUpdate,
					(data: IGameUpdatePacketHeader) => {
						store.dispatch(updateGamesBoard(data));
					}
				);

				socket.on(
					SocketEvent.SyncWithServer,
					(packet: ITickAdjustmentPacket) => {
						store.dispatch(updateTickAdjustments(packet));
					}
				);

				socket.on(SocketEvent.GameOver, (data: IPlayer[]) => {
					store.dispatch(onAllGamesOver(data));
					store.dispatch(gameOver());
				});

				socket.on(
					SocketEvent.StartingGame,
					(data: {
						playerGame: IGame;
						gameMode: GameMode;
						seed: string;
						opponentsGames?: IGame[];
					}) => {
						store.dispatch(setGameStarted(true));
						store.dispatch(setGameStartingState(data));
					}
				);

				socket.on(
					SocketEvent.IndestructibleLine,
					(packet: IIndestructiblePacket) => {
						store.dispatch(updateIndestructibleLines(packet));
					}
				);
			}
		}

		if (socket) {
			if (sign.match(action)) {
				store.dispatch(
					createPlayer({ name: action.payload, id: socket.id })
				);
			}

			if (createLobby.match(action)) {
				socket.emit(SocketEvent.CreateLobby, {
					data: action.payload,
				});
			}

			if (joinLobby.match(action)) {
				socket.emit(SocketEvent.JoinLobby, { data: action.payload });
			}

			if (leaveLobby.match(action)) {
				socket.emit(SocketEvent.LeaveLobby, action.payload);
			}

			if (sendStartGame.match(action)) {
				socket.emit(SocketEvent.StartGame, action.payload);
			}

			if (leaveGame.match(action)) {
				socket.emit(SocketEvent.LeaveGame);
			}
		}
		next(action);
	};
};

export default socketMiddleware;
