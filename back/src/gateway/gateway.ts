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
import { ITickAdjustmentPacket, SocketEvent } from 'src/type/event.enum';
import { LobbyManager } from '../lobby/lobby-manager';
import { GameSocketManager } from '../game/game-socket-manager';
import { SoloGame } from '../game/solo-game';
import { Player } from '../game/player';
import {
	CreateLobbyDto,
	InputsPacketDto,
	JoinLobbyDto,
	StartGameDto,
	TickAdjustmentPacketDto,
} from 'src/utils/dto/gateway.dto';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WsExceptionFilter } from 'src/utils/exceptionFilter';
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
		private readonly lobbyManager: LobbyManager,
		private readonly gameService: GameService
	) {}

	afterInit(_server: Server) {
		this.gatewayService.server = _server;
	}

	async handleConnection(socket: Socket) {
		console.log('new connection: ', socket.id);
	}

	async handleDisconnect(socket: Socket) {
		console.log('disconnection: ', socket.id);
		this.lobbyManager.leave(socket);
		this.gameService.leave(socket.id);
		// const game = this.gameManager.getGameFromSocket(socket.id);
		// if (game) {
		// 	game.leave(socket.id);
		// 	this.gameManager.deleteGameFromSocket(socket.id);
		// }
	}

	@SubscribeMessage(SocketEvent.CreateLobby)
	createLobby(
		@ConnectedSocket() socket: Socket,
		@MessageBody('data') data: CreateLobbyDto
	) {
		console.log('Data = ', data);
		if (!this.lobbyManager.getLobby(socket.id)) {
			this.lobbyManager.createLobby(socket, data.playerName, data.name);
		}
	}

	@SubscribeMessage(SocketEvent.JoinLobby)
	joinLobby(
		@ConnectedSocket() socket: Socket,
		@MessageBody('data') data: JoinLobbyDto
	) {
		this.lobbyManager.leave(socket);
		this.gameService.leave(socket.id);
		this.lobbyManager.joinLobby(
			socket,
			data.playerName,
			data.lobbyId,
			this.server
		);
		//todo check if lobby is full
	}

	@SubscribeMessage(SocketEvent.LeaveLobby)
	leaveLobby(@ConnectedSocket() socket: Socket) {
		this.lobbyManager.leave(socket);
	}

	@SubscribeMessage(SocketEvent.StartGame)
	startGame(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: StartGameDto
	) {
		this.gameService.startGame(socket.id, data.playerName);
	}

	// @SubscribeMessage(SocketEvent.StopGame)
	// stopGame(@ConnectedSocket() socket: Socket) {
	// 	this.lobbyManager.getLobby(socket.id)?.stopGames();
	// }

	@SubscribeMessage(SocketEvent.CommandPressed)
	commandPressed(
		@ConnectedSocket() socket: Socket,
		@MessageBody('data') data: InputsPacketDto
	) {
		// console.log('command pressed: ', data);
		//TODO check if command is valid
		this.gameService.pushInputs(socket.id, data);
		// this.gameManager
		// 	.getGameFromSocket(socket.id)
		// 	?.getPlayerGame(socket.id)
		// 	.pushInputsInQueue(data);
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
		console.log('leave game');
		this.gameService.leave(socket.id);
	}

	@SubscribeMessage('pong')
	pong(@ConnectedSocket() socket: Socket) {
		// const game = this.lobbyManager
		// 	.getLobby(socket.id)
		// 	?.getPlayerGame(socket.id);
		// if (game) {
		// 	const ping = performance.now() - game.lastPacketSendAt;
		// 	console.log(
		// 		'client: ',
		// 		game.player.name,
		// 		' - ping: ',
		// 		ping.toFixed(2) + 'ms'
		// 	);
		// }
	}

	//TESTER
	// @SubscribeMessage('add_indestructible')
	// addIndestructible(@ConnectedSocket() socket: Socket) {
	// 	const lobby = this.lobbyManager.getLobbys();
	// 	if (lobby.length > 0) {
	// 		const game = lobby[0].game.games[0];
	// 		// game.addIndestructibleLines(1);
	// 		game.indestructibleToGive = 1;
	// 	}
	// }
}
