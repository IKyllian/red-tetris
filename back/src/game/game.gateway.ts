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
	startGame(client: any, payload: any) {
		console.log('play', payload);
	}
}
