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
import { SocketEvent } from '../type/event.enum';
import { LobbyService } from '../lobby/lobby.service';
import {
	CreateLobbyDto,
	InputsPacketDto,
	JoinLobbyDto,
	StartGameDto,
	TickAdjustmentPacketDto,
} from '../utils/dto/gateway.dto';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WsExceptionFilter } from '../utils/exceptionFilter';
import { GameService } from '../game/game.service';
import { GatewayService } from './gateway.service';

@UseFilters(WsExceptionFilter)
@UsePipes(new ValidationPipe())
@WebSocketGateway({
	cors: {
		origin: '*',
	},
})
export class Gateway
	implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
	@WebSocketServer() server: Server;

	constructor(
		private readonly gatewayService: GatewayService,
		private readonly LobbyService: LobbyService,
		private readonly gameService: GameService
	) {}

	afterInit(_server: Server) {
		this.gatewayService.server = _server;
	}

	handleConnection(_socket: Socket) {}

	handleDisconnect(socket: Socket) {
		this.LobbyService.leave(socket);
		this.gameService.leave(socket.id);
	}

	@SubscribeMessage(SocketEvent.CreateLobby)
	createLobby(
		@ConnectedSocket() socket: Socket,
		@MessageBody('data') data: CreateLobbyDto
	) {
		if (!this.LobbyService.getLobby(socket.id)) {
			this.LobbyService.createLobby(socket, data.playerName, data.name);
		}
	}

	@SubscribeMessage(SocketEvent.JoinLobby)
	joinLobby(
		@ConnectedSocket() socket: Socket,
		@MessageBody('data') data: JoinLobbyDto
	) {
		this.LobbyService.leave(socket);
		this.gameService.leave(socket.id);
		this.LobbyService.joinLobby(
			socket,
			data.playerName,
			data.lobbyId,
			this.server,
			data.createLobbyIfNotExists
		);
	}

	@SubscribeMessage(SocketEvent.LeaveLobby)
	leaveLobby(@ConnectedSocket() socket: Socket) {
		this.LobbyService.leave(socket);
	}

	@SubscribeMessage(SocketEvent.StartGame)
	startGame(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: StartGameDto
	) {
		this.gameService.startGame(socket.id, data.playerName);
	}

	@SubscribeMessage(SocketEvent.CommandPressed)
	commandPressed(
		@ConnectedSocket() socket: Socket,
		@MessageBody('data') data: InputsPacketDto
	) {
		this.gameService.pushInputs(socket.id, data);
	}

	@SubscribeMessage(SocketEvent.SyncWithServer)
	syncWithServer(
		@ConnectedSocket() socket: Socket,
		@MessageBody('data')
		data: TickAdjustmentPacketDto
	) {
		this.gameService.syncWithServer(socket, data);
	}

	@SubscribeMessage(SocketEvent.LeaveGame)
	leaveGame(@ConnectedSocket() socket: Socket) {
		this.gameService.leave(socket.id);
	}
}
