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
import { IInputsPacket, SocketEvent } from 'src/type/event.enum';
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

	afterInit(_server: Server) {}

	async handleConnection(socket: Socket) {
		console.log('new connection: ', socket.id);
		// const board = new Board(defaultBoardSize);
		// board.printBoard();
		// board.checkForLines();
		// board.printBoard();
	}

	async handleDisconnect(socket: Socket) {
		console.log('disconnection: ', socket.id);
		this.lobbyManager.leaveLobby(socket);
	}

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
		// console.log('Join lobby = ', data);
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
	startGame(@ConnectedSocket() socket: Socket) {
		//TODO check if game is already started
		const lobby = this.lobbyManager.getLobby(socket.id);
		if (
			lobby &&
			!lobby.gameStarted &&
			lobby.getPlayer(socket.id)?.isLeader
		) {
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
		@MessageBody('data') data: IInputsPacket
	) {
		// console.log('command pressed: ', data);
		//TODO check if command is valid
		// if (isCommandType(command)) {
		// console.log('command pressed: ', data);
		const lobby: Lobby | undefined = this.lobbyManager.getLobby(socket.id);
		if (lobby && lobby.gameStarted) {
			const game = lobby.getPlayerGame(socket.id);
			if (game && !game.gameOver) {
				game.pushInputsInQueue(data);
			}
		}
		// }
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
	@SubscribeMessage('add_indestructible')
	addIndestructible(@ConnectedSocket() socket: Socket) {
		const lobby = this.lobbyManager.getLobbys();
		if (lobby.length > 0) {
			const game = lobby[0].games[0];
			// game.addDestructibleLines(1);
			game.destructibleLinesToGive = 1;
		}
	}
}
