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
import { Game } from './game';
import { SocketEvent } from 'src/type/event.enum';
import { Lobby } from './lobby';

@WebSocketGateway({
	cors: {
		origin: '*',
	},
})
export class GameGateway
	implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
	@WebSocketServer() server: Server;

	private lobbys: Lobby[] = [];

	async handleConnection(socket: Socket) {
		console.log('TEST = ', socket.id);
	}

	async handleDisconnect(socket: Socket) {}

	afterInit(_server: Server) {}

	@SubscribeMessage(SocketEvent.CreateLobby)
	createLobby(
		@ConnectedSocket() socket: Socket,
		@MessageBody('data') data: { name: string; playerName: string }
	) {
		console.log('Data = ', data);
		const lobby = new Lobby(data.name, data.playerName, socket.id);
		this.lobbys.push(lobby);
		socket.emit(SocketEvent.UpdateLobby, lobby);
	}

	@SubscribeMessage(SocketEvent.JoinLobby)
	joinLobby(
		@ConnectedSocket() socket: Socket,
		@MessageBody('data') data: { playerName: string; lobbyId: string }
	) {
		const lobby: Lobby | undefined = this.lobbys.find(
			(lobby: Lobby) => lobby.id === data.lobbyId
		);
		//todo check if lobby is full
		if (lobby) {
			lobby.addPlayer(data.playerName, socket.id);
			for (const player of lobby.players) {
				this.server.to(player.id).emit(SocketEvent.UpdateLobby, lobby);
			}
		}
	}

	@SubscribeMessage(SocketEvent.LeaveLobby)
	leaveLobby(
		@ConnectedSocket() socket: Socket,
		@MessageBody('data') lobbyId: string
	) {
		const lobby: Lobby | undefined = this.lobbys.find(
			(lobby: Lobby) => lobby.id === lobbyId
		);
		if (lobby) {
			lobby.deletePlayer(socket.id);
			if (lobby.players.length === 0) {
				this.lobbys = this.lobbys.filter(
					(lob: Lobby) => lob.id != lobby.id
				);
			} else {
				for (const player of lobby.players) {
					this.server
						.to(player.id)
						.emit(SocketEvent.UpdateLobby, lobby);
				}
			}
		}
	}

	@SubscribeMessage('play')
	handlePlay(client: any, payload: any) {
		console.log('play', payload);
	}
}
