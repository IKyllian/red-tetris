import { Game } from './game';
import { Player } from './player';
import { Server } from 'socket.io';
import { SocketEvent } from 'src/type/event.enum';
import {
	IGameUpdatePacket,
	IGameUpdatePacketHeader,
	UpdateType,
} from 'src/type/packet.type';
import { GameMode, MIN_TIME_BETWEEN_TICKS } from 'src/type/game.type';
import { Repository } from 'typeorm';
import { Leaderboard } from 'src/entity/leaderboard.entity';
import { LeaderboardService } from 'src/leaderboard/leaderboard.service';

export class SoloGame {
	public game: Game;
	public tick: number = 0;

	private seed: string;
	private server: Server;
	private lastUpdate: number;
	private timer: number = 0;
	//TODO: Send score
	private ranking: Player[] = [];
	private leaderboardService: LeaderboardService;

	constructor(
		player: Player,
		server: Server,
		leaderboardService: LeaderboardService
	) {
		this.leaderboardService = leaderboardService;
		this.server = server;
		this.seed = this.createRandomSeed();
		this.game = new Game(player, this.seed, GameMode.SOLO);
	}

	private createRandomSeed(length: number = 20) {
		const chars =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	private sendUpdates() {
		if (this.game.hasQuit) {
			console.log('game has quit');
		}
		let gamePackets: IGameUpdatePacket[] = [];
		if (this.game.positionChanged || this.game.boardChanged) {
			gamePackets.push({
				updateType: UpdateType.GAME,
				state: this.game.getDataToSend(),
			});
		}
		if (gamePackets.length > 0) {
			const dataToSend: IGameUpdatePacketHeader = {
				tick: this.tick,
				tickAdjustment: this.game.tickAdjustment,
				adjustmentIteration: this.game.adjustmentIteration,
				gamePackets: gamePackets,
			};
			this.server
				.to(this.game.player.id)
				.emit(SocketEvent.GamesUpdate, dataToSend);
		}
	}

	private checkGameOver(): boolean {
		if (this.game.hasQuit) {
			return true;
		} else if (this.game.gameOver) {
			this.server.emit(SocketEvent.GameOver, this.ranking);
			if (this.game.score > 0) {
				try {
					this.leaderboardService.create(
						this.game.player.name,
						this.game.score
					);
				} catch (error) {
					console.error('error creating leaderboard entry', error);
				}
			}
			return true;
		}
		return false;
	}

	private update() {
		const now = performance.now();
		const deltaTime = now - this.lastUpdate;
		this.lastUpdate = now;
		this.timer += deltaTime;
		while (this.timer >= MIN_TIME_BETWEEN_TICKS) {
			if (this.tick < 90) {
				this.tick++;
				this.timer -= MIN_TIME_BETWEEN_TICKS;
				continue;
			}
			if (this.tick === 90) {
				console.log('starting game');
			}
			// console.log('tick: ', this.tick, ' - gravity: ', this.gravity);
			this.game.updateState(this.tick);
			if (this.game.gameOver && this.game.boardChanged) {
				this.ranking.push(this.game.player);
			}

			this.sendUpdates();
			if (this.checkGameOver()) {
				return;
			}
			this.timer -= MIN_TIME_BETWEEN_TICKS;
			this.tick++;
		}

		setTimeout(this.update.bind(this), MIN_TIME_BETWEEN_TICKS);
	}

	public start() {
		this.server.to(this.game.player.id).emit(SocketEvent.StartingGame, {
			playerGame: this.game.getDataToSend(),
			gameMode: GameMode.SOLO,
			seed: this.seed,
		});
		this.lastUpdate = performance.now();
		this.update();
	}

	public leave() {
		this.game.hasQuit = true;
	}

	public getPlayerGame(_playerId: string): Game {
		return this.game;
	}
}
