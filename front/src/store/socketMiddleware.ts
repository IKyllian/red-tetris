import { Middleware } from '@reduxjs/toolkit';
import SocketFactory from 'front/store/socketFactory';
import {
	connectionEstablished,
	connectionLost,
	initSocket,
} from 'front/store/socket.slice';
import { IGame } from 'front/types/board.types';
import {
	// commandPressed,
	createLobby,
	joinLobby,
	leaveLobby,
	setLobby,
	sendStartGame,
	setGameStarted,
	onAllGamesOver,
	// sendInputs,
} from 'front/store/lobby.slice';
import { ILobby } from 'front/types/lobby.type';
import { createPlayer, sign } from 'front/store/player.slice';
import { IPlayer } from 'front/types/player.type';
import { IGameUpdatePacketHeader } from 'front/types/packet.types';
import {
	sendInputs,
	setGameStartingState,
	updateGamesBoard,
	updateIndestructibleLines,
} from './game.slice';
import { Socket, io } from 'socket.io-client';

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
					console.log('Updated Lobby = ', lobby);
					store.dispatch(setLobby(lobby));
				});

				socket.on(
					SocketEvent.GamesUpdate,
					(data: IGameUpdatePacketHeader) => {
						socket.emit('pong');
						store.dispatch(updateGamesBoard(data));
						// store.dispatch(
						// 	setTickAdjustments({
						// 		packet: data,
						// 		playerId: socket.id,
						// 	})
						// );
					}
				);

				socket.on(SocketEvent.GameOver, (data: IPlayer[]) => {
					console.log('GameOver = ', data);
					store.dispatch(onAllGamesOver(data));
				});

				socket.on(
					SocketEvent.StartingGame,
					(data: {
						playerGame: IGame;
						opponentsGames: IGame[];
						seed: string;
					}) => {
						console.log('StartingGame = ', data);
						store.dispatch(setGameStarted(true));
						store.dispatch(setGameStartingState(data));
					}
				);

				socket.on(
					SocketEvent.IndestructibleLine,
					(nbOflines: number) => {
						store.dispatch(updateIndestructibleLines(nbOflines));
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
				socket.emit(SocketEvent.StartGame);
			}

			if (sendInputs.match(action)) {
				let command = { data: { ...action.payload } };
				socket.emit(SocketEvent.CommandPressed, command);
			}
		}
		
		next(action);
	};
};

export default socketMiddleware;
