import { Game, IGame } from './game';
import { Lobby } from '../lobby/lobby';
import { Player } from './player';
import { Server } from 'socket.io';
import { SocketEvent } from '../type/event.enum';
import {
	IGameUpdatePacket,
	IGameUpdatePacketHeader,
	IIndestructiblePacket,
	UpdateType,
} from '../type/packet.type';
import { GameMode, MIN_TIME_BETWEEN_TICKS } from '../type/game.type';

export class BattleRoyal {
	public lobby: Lobby;
	public games: Game[];
	public seed: string;

	private server: Server;
	public tick: number = 0;
	private lastUpdate: number;
	private timer: number = 0;
	private ranking: Player[] = [];
	private nbOfPlayerAlive: number = 0;
	private gravity: number = 0.04;

	constructor(lobby: Lobby, server: Server) {
		this.lobby = lobby;
		this.server = server;
		this.games = [];
		this.seed = this.createRandomSeed();
		for (const player of this.lobby.players) {
			this.games.push(new Game(player, this.seed, GameMode.BATTLEROYAL));
		}
		this.nbOfPlayerAlive = this.games.length;
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

	private handleIndestructibleLine(game: Game) {
		for (const otherGame of this.games) {
			const maxTickOffset = this.games.reduce(
				(acc, game) => Math.max(acc, game.tickAdjustment),
				0
			);
			const tickOffset = this.tick + maxTickOffset + 30;
			if (otherGame.player.id !== game.player.id && !otherGame.gameOver) {
				const indestructiblePacket: IIndestructiblePacket = {
					tick: tickOffset,
					nb: game.indestructibleToGive,
				};
				otherGame.indestructibleQueue.push(indestructiblePacket);
				this.server
					.to(otherGame.player.id)
					.emit(SocketEvent.IndestructibleLine, indestructiblePacket);
			}
		}
		game.indestructibleToGive = 0;
	}

	private sendUpdates() {
		for (const playerGame of this.games) {
			if (playerGame.hasQuit) {
				continue;
			}
			let gamePackets: IGameUpdatePacket[] = [];
			for (const game of this.games) {
				// Send all game data to player if position changed
				if (
					playerGame.player.id === game.player.id &&
					game.positionChanged
				) {
					gamePackets.push({
						updateType: UpdateType.GAME,
						state: game.getDataToSend(),
					});
				} else if (game.boardChanged) {
					gamePackets.push({
						updateType: UpdateType.GAME,
						state: game.getDataToSend(),
					});
				} else if (game.positionChanged && this.nbOfPlayerAlive <= 4) {
					gamePackets.push({
						updateType: UpdateType.POSITION,
						state: {
							player: game.player,
							piece: game.piece,
						},
					});
				}
			}
			if (gamePackets.length > 0) {
				// console.log('tick: ', this.tick);
				// console.log('player Piece: ', playerGame.piece);
				// playerGame.board.printBoard();
				// console.log('--------------------------------------------');
				const dataToSend: IGameUpdatePacketHeader = {
					tick: this.tick,
					tickAdjustment: playerGame.tickAdjustment,
					adjustmentIteration: playerGame.adjustmentIteration,
					gamePackets: gamePackets,
				};
				this.server
					.to(playerGame.player.id)
					.emit(SocketEvent.GamesUpdate, dataToSend);
			}
		}
	}

	private checkGameOver(): boolean {
		if (
			this.games.length === this.ranking.length ||
			(this.games.length > 1 &&
				this.ranking.length === this.games.length - 1)
		) {
			const winner = this.games.find((game) => !game.gameOver);
			if (winner) {
				this.ranking.unshift(winner.player);
			}
			this.server
				.to(this.lobby.id)
				.emit(SocketEvent.GameOver, this.ranking);
			this.lobby.gameStarted = false;
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
			for (const game of this.games) {
				game.updateState(this.tick, this.gravity);
				if (game.gameOver && game.boardChanged) {
					this.nbOfPlayerAlive--;
					this.ranking.unshift(game.player);
				}
				if (game.indestructibleToGive > 0) {
					this.handleIndestructibleLine(game);
				}
			}

			this.sendUpdates();
			if (this.checkGameOver()) {
				return;
			}
			if (this.tick && this.tick % 1800 === 0) {
				this.gravity += 0.005;
			}
			this.timer -= MIN_TIME_BETWEEN_TICKS;
			this.tick++;
		}

		setTimeout(this.update.bind(this), MIN_TIME_BETWEEN_TICKS);
	}

	public start() {
		this.lobby.gameStarted = true;
		let playerGame: IGame;
		for (const game of this.games) {
			const filteredData = this.games.filter(
				(elem) => elem.player.id != game.player.id
			);
			const dataToSend = filteredData.map((data) => data.getDataToSend());
			const playerGameFound = this.games.find(
				(elem) => elem.player.id === game.player.id
			);

			playerGame = playerGameFound.getDataToSend();
			this.server.to(game.player.id).emit(SocketEvent.StartingGame, {
				playerGame: playerGame,
				gameMode: GameMode.BATTLEROYAL,
				seed: this.seed,
				opponentsGames: dataToSend,
			});
		}
		this.lastUpdate = performance.now();
		this.update();
	}

	public leave(playerId?: string) {
		const index = this.games.findIndex(
			(game) => game.player.id === playerId
		);
		if (index !== -1) {
			if (!this.games[index].gameOver) {
				this.games[index].hasQuit = true;
			}
		}
	}

	public getPlayerGame(playerId: string): Game | undefined {
		return this.games.find((game) => game.player.id === playerId);
	}
}
