import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketEvent } from 'src/type/event.enum';
import { LobbyManager } from './lobby-manager';
import { COMMANDS, isCommandType } from 'src/type/command.types';
import { Lobby } from './lobby';
import { Board } from './board';
import { defaultBoardSize } from 'src/type/board.interface';

@WebSocketGateway({
	cors: {
		origin: '*',
	},
})
export class GameGateway
	implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
	@WebSocketServer() server: Server;

	private lobbyManager = new LobbyManager();

	async handleConnection(socket: Socket) {
		console.log('TEST = ', socket.id);
		// const board = new Board(defaultBoardSize);
		// board.printBoard();
		// board.checkForLines();
		// board.printBoard();
	}

	async handleDisconnect(socket: Socket) {
		this.lobbyManager.leaveLobby(socket);
	}

	afterInit(_server: Server) {}

	@SubscribeMessage(SocketEvent.CreateLobby)
	createLobby(
		@ConnectedSocket() socket: Socket,
		@MessageBody('data') data: { name: string; playerName: string }
	) {
		console.log('Data = ', data);
		this.lobbyManager.createLobby(socket, data.playerName, data.name);
	}

	@SubscribeMessage(SocketEvent.JoinLobby)
	joinLobby(
		@ConnectedSocket() socket: Socket,
		@MessageBody('data') data: { playerName: string; lobbyId: string }
	) {
		this.lobbyManager.joinLobby(socket, data.playerName, data.lobbyId);
		//todo check if lobby is full
	}

	@SubscribeMessage(SocketEvent.LeaveLobby)
	leaveLobby(
		@ConnectedSocket() socket: Socket,
		@MessageBody('data') lobbyId: string // TODO plus besoin
	) {
		this.lobbyManager.leaveLobby(socket);
	}

	@SubscribeMessage(SocketEvent.StartGame)
	startGame(@ConnectedSocket() socket: Socket) {
		//TODO check if game is already started
		const lobby = this.lobbyManager.getLobby(socket.id);
		if (!lobby.gameStarted) {
			lobby.startGames(this.server);
		}
	}

	@SubscribeMessage(SocketEvent.StopGame)
	stopGame(@ConnectedSocket() socket: Socket) {
		this.lobbyManager.getLobby(socket.id)?.stopGames();
	}

	@SubscribeMessage(SocketEvent.CommandPressed)
	commandPressed(
		@ConnectedSocket() socket: Socket,
		// @MessageBody('command') command: COMMANDS
		@MessageBody('data') data: { command: COMMANDS }
	) {
		const command = data.command;
		// console.log('Command pressed = ', command);
		//TODO check if command is valid
		if (isCommandType(command)) {
			const lobby: Lobby | undefined = this.lobbyManager.getLobby(
				socket.id
			);
			if (lobby && lobby.gameStarted) {
				lobby.getPlayerGame(socket.id)?.handleCommand(command);
			}
		}
	}
}
