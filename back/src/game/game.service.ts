import { Injectable } from '@nestjs/common';
import { GameSocketManager } from './game-socket-manager';
import { LobbyManager } from 'src/lobby/lobby-manager';
import { SoloGame } from './solo-game';
import { Player } from './player';
import { Socket } from 'socket.io';
import { BattleRoyal } from './battleRoyal';
import { GatewayService } from 'src/gateway/gateway.service';
import {
	InputsPacketDto,
	TickAdjustmentPacketDto,
} from 'src/utils/dto/gateway.dto';
import { ITickAdjustmentPacket, SocketEvent } from 'src/type/event.enum';
import { LeaderboardService } from 'src/leaderboard/leaderboard.service';

@Injectable()
export class GameService {
	private readonly gameSocketMap: GameSocketManager = new GameSocketManager();

	constructor(
		private readonly gatewayService: GatewayService,
		private readonly lobbyService: LobbyManager,
		private readonly leaderboardService: LeaderboardService
	) {}

	startGame(socketId: string, playerName: string) {
		const lobby = this.lobbyService.getLobby(socketId);
		if (
			lobby &&
			!lobby.gameStarted &&
			lobby.getPlayer(socketId)?.isLeader
		) {
			const battleRoyal = new BattleRoyal(
				lobby,
				this.gatewayService.server
			);
			lobby.players.forEach((player) => {
				this.gameSocketMap.setGameToSocket(player.id, battleRoyal);
			});
			battleRoyal.start();
		} else {
			const soloGame = new SoloGame(
				new Player(playerName, socketId, true),
				this.gatewayService.server,
				this.leaderboardService
			);
			this.gameSocketMap.setGameToSocket(socketId, soloGame);
			soloGame.start();
		}
	}

	leave(socketId: string) {
		const game = this.gameSocketMap.getGameFromSocket(socketId);
		if (game) {
			game.leave(socketId);
			this.gameSocketMap.deleteGameFromSocket(socketId);
		}
	}

	pushInputs(socketId: string, inputsPacket: InputsPacketDto) {
		this.gameSocketMap
			.getGameFromSocket(socketId)
			?.getPlayerGame(socketId)
			.pushInputsInQueue(inputsPacket);
	}

	syncWithServer(socket: Socket, data: TickAdjustmentPacketDto) {
		const gameLobby = this.gameSocketMap.getGameFromSocket(socket.id);
		const game = gameLobby?.getPlayerGame(socket.id);
		const { tick, adjustmentIteration } = data;
		if (
			gameLobby &&
			gameLobby.tick + 1 > tick &&
			adjustmentIteration === game.adjustmentIteration
		) {
			game.adjustmentIteration++;
			const packet: ITickAdjustmentPacket = {
				tickAdjustment: gameLobby.tick - tick + 15,
				adjustmentIteration: game.adjustmentIteration,
			};
			socket.emit(SocketEvent.SyncWithServer, packet);
		}
	}
}
