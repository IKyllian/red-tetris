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
import {
	IInputsPacket,
	ITickAdjustmentPacket,
	SocketEvent,
} from 'src/type/event.enum';
import { LobbyManager } from '../lobby/lobby-manager';
import { COMMANDS, isCommandType } from 'src/type/command.types';
import { Board } from './board';
import { defaultBoardSize } from 'src/type/board.interface';
import { Lobby } from '../lobby/lobby';
import { GameSocketManager } from './game-socket-manager';
import { SoloGame } from './solo-game';
import { Player } from './player';
import {
	CreateLobbyDto,
	InputsPacketDto,
	JoinLobbyDto,
	StartGameDto,
	TickAdjustmentPacketDto,
} from 'src/utils/dto/gateway.dto';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WsExceptionFilter } from 'src/utils/exceptionFilter';

@UseFilters(WsExceptionFilter)
@UsePipes(new ValidationPipe())
@WebSocketGateway({
	cors: {
		origin: '*',
	},
})
export class GameGateway
	implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
	@WebSocketServer() server: Server;

	// private lobbyManager = new LobbyManager();
	private gameManager = new GameSocketManager();

	constructor(private lobbyManager: LobbyManager) {}

	afterInit(_server: Server) {}

	async handleConnection(socket: Socket) {
		console.log('new connection: ', socket.id);
	}

	async handleDisconnect(socket: Socket) {
		console.log('disconnection: ', socket.id);
		this.lobbyManager.leaveLobby(socket);
		const game = this.gameManager.getGameFromSocket(socket.id);
		if (game) {
			game.leave(socket.id);
			this.gameManager.deleteGameFromSocket(socket.id);
		}
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
		// console.log('Join lobby = ', data);
		// console.log('Lobby manager = ', this.lobbyManager.getLobbys());
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
		this.lobbyManager.leaveLobby(socket);
	}

	@SubscribeMessage(SocketEvent.StartGame)
	startGame(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: StartGameDto
	) {
		//TODO check if game is already started
		console.log("TEST")
		const lobby = this.lobbyManager.getLobby(socket.id);
		if (lobby) {
			if (!lobby.gameStarted && lobby.getPlayer(socket.id)?.isLeader) {
				lobby.startGame(this.server, this.gameManager);
			}
		} else {
			const soloGame = new SoloGame(
				new Player(data.playerName, socket.id, true),
				this.server
			);
			this.gameManager.setGameToSocket(socket.id, soloGame);
			soloGame.start();
		}
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
		this.gameManager
			.getGameFromSocket(socket.id)
			?.getPlayerGame(socket.id)
			.pushInputsInQueue(data);
	}

	@SubscribeMessage(SocketEvent.SyncWithServer)
	syncWithServer(
		@ConnectedSocket() socket: Socket,
		@MessageBody('data')
		data: TickAdjustmentPacketDto
	) {
		const gameLobby = this.gameManager.getGameFromSocket(socket.id);
		const game = gameLobby?.getPlayerGame(socket.id);
		const { tick, adjustmentIteration } = data;
		if (
			gameLobby &&
			gameLobby.tick + 1 > tick &&
			adjustmentIteration === game.adjustmentIteration
		) {
			// console.log('syncing with server');
			// console.log(
			// 	'server tick: ',
			// 	lobby.tick,
			// 	'client tick: ',
			// 	tick,
			// 	'adjustmentIteration: ',
			// 	adjustmentIteration,
			// 	'game.adjustmentIteration: ',
			// 	game.adjustmentIteration
			// );
			game.adjustmentIteration++;
			const packet: ITickAdjustmentPacket = {
				tickAdjustment: gameLobby.tick - tick + 5,
				adjustmentIteration: game.adjustmentIteration,
			};
			socket.emit(SocketEvent.SyncWithServer, packet);
		}
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
