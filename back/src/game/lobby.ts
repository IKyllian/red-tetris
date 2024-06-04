import { set } from 'lodash';
import { Game, IGame } from './game';
import { Piece } from './piece';
import { Player } from './player';
import { Server } from 'socket.io';
import { SocketEvent } from 'src/type/event.enum';
import { Board } from './board';

const MIN_TIME_BETWEEN_TICKS = 1000 / 30;

export enum UpdateType {
	POSITION = 1,
	GAME,
}

interface IGameUpdatePacketHeader {
	tick: number;
	tickAdjustment: number;
	adjustmentIteration: number;
	gamePackets: IGameUpdatePacket[];
}
interface IGameUpdatePacket {
	updateType: number;
	//TODO send piece Index to compare in client to clear old piece
	state: IGame | { player: Player; piece: Piece };
}
export class Lobby {
	public name: string;
	public id: string;
	public gameStarted: boolean = false;
	public players: Player[] = [];
	public games: Game[] = [];
	public seed: string;

	private gameInterval: NodeJS.Timeout | null = null;
	private server: Server;
	private tick: number = 0;
	private lastUpdate: number;
	private timer: number = 0;
	private ranking: Player[] = [];
	private nbOfPlayerAlive: number = 0;

	constructor(name: string, playerName: string, playerId: string) {
		this.name = name;
		this.players.push(new Player(playerName, playerId, true));
		this.id = this.createRandomId();
		console.log('Lobby created with id: ', this.id);
		console.log('nbOfPlayerAlive', this.nbOfPlayerAlive);
		this.seed = 'test';
	}

	private createRandomId(length: number = 5) {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	public addPlayer(playerName: string, playerId: string) {
		this.players.push(new Player(playerName, playerId));
	}

	public deletePlayer(playerId: string) {
		this.players = this.players.filter(
			(player: Player) => player.id != playerId
		);
	}

	// private generatePieces(nb: number): Piece[] {
	// 	let newPieces: Piece[] = [];
	// 	for (let i = 0; i < nb; ++i) {
	// 		newPieces.push(new Piece());
	// 	}
	// 	this.pieces = [...this.pieces, ...newPieces];
	// 	return newPieces;
	// }

	//TODO classement, emit game over, errors, when leaving lobby in game, gamover in Game true
	//  send board only if line cleared or destructible lines?
	// do better update Type
	// Separate game  and lobby
	private updateState() {
		if (this.gameStarted === false) {
			this.stopGames();
			return;
		}
		const now = performance.now();
		const deltaTime = now - this.lastUpdate;
		this.lastUpdate = now;
		this.timer += deltaTime;
		while (this.timer >= MIN_TIME_BETWEEN_TICKS) {
			for (const game of this.games) {
				game.updateState(this.tick);
				if (game.gameOver && game.boardChanged) {
					this.nbOfPlayerAlive--;
					this.ranking.push(game.player);
				}
				if (game.destructibleLinesToGive > 0) {
					for (const otherGame of this.games) { // TODO: Mettre en dehors de la boucle ?
						if (
							otherGame.player.id !== game.player.id &&
							!otherGame.gameOver
						) {
							otherGame.addDestructibleLines(
								game.destructibleLinesToGive
							);
						}
					}
					game.destructibleLinesToGive = 0;
				}
			}

			let gamePackets: IGameUpdatePacket[] = [];
			for (const game of this.games) {
				if (game.boardChanged) {
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
				for (const game of this.games) {
					game.lastPacketSendAt = performance.now();
					const playerPacketIndex = gamePackets.findIndex(
						(packet) => packet.state.player.id === game.player.id
					);
					let playerPacket: IGameUpdatePacket[] | undefined;
					if (playerPacketIndex !== -1 && gamePackets[playerPacketIndex].updateType === UpdateType.POSITION) {
						playerPacket = gamePackets.splice(playerPacketIndex, 1);
						gamePackets.push({updateType: UpdateType.GAME, state: game.getDataToSend()})
					}
					// if (playerPacket && playerPacket.updateType === UpdateType.POSITION) {
					// 	playerPacket.updateType = UpdateType.GAME;
					// 	playerPacket.state = game.getDataToSend();
					// }
					// else if (game.positionChanged) {
					// 	gamePackets.push({
					// 		updateType: UpdateType.GAME,
					// 		state: game.getDataToSend(),
					// 	});
					// }
					const dataToSend: IGameUpdatePacketHeader = {
						tick: this.tick,
						tickAdjustment: game.tickAdjustment,
						adjustmentIteration: game.adjustmentIteration,
						gamePackets: gamePackets,
					};
					this.server
						.to(game.player.id)
						.emit(SocketEvent.GamesUpdate, dataToSend);
					if (playerPacket?.length > 0) {
						gamePackets.pop();
						gamePackets.push(playerPacket[0])
					}
					game.boardChanged = false;
					game.positionChanged = false;
				}
			}
			if (
				this.games.length === this.ranking.length ||
				(this.games.length > 1 &&
					this.ranking.length === this.games.length - 1)
			) {
				//todo get last player alive
				this.server.emit(SocketEvent.GameOver, this.ranking);
				this.stopGames();
				return;
			}
			this.timer -= MIN_TIME_BETWEEN_TICKS;
			this.tick++;
		}

		this.gameInterval = setTimeout(
			this.updateState.bind(this),
			MIN_TIME_BETWEEN_TICKS
		);
	}

	public startGames(server: Server) {
		this.games = [];
		this.server = server;
		this.gameStarted = true;
		// this.generatePieces(100);
		//TODO generate seed here
		let playerGame: IGame;
		this.nbOfPlayerAlive = this.players.length;
		for (const player of this.players) {
			this.games.push(new Game(player, 0, this.seed));
		}
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
				opponentsGames: dataToSend,
				seed: this.seed,
			});
		}
		// sleep some miliseconds
		// setTimeout(() => {
		// 	this.lastUpdate = performance.now();
		// 	this.updateState();
		// }, 500);
		this.lastUpdate = performance.now();
		this.updateState();
		// setTimeout(
		// 	this.updateState.bind(this),
		// 	MIN_TIME_BETWEEN_TICKS
		// );
	}

	public cancelGames() {
		this.gameStarted = false;
	}

	public stopGames() {
		// if (this.gameInterval !== null) {
		// 	clearTimeout(this.gameInterval);
		// 	this.gameInterval = null;
		// 	console.log('Game stopped.');
		// } else {
		// 	console.log('The game is not currently running.');
		// }
		console.log('Game stopped.');

		this.gameStarted = false;
	}

	public getPlayer(playerId: string): Player | undefined {
		return this.players.find((player) => player.id === playerId);
	}

	public getPlayerGame(playerId: string): Game | undefined {
		return this.games.find((game) => game.player.id === playerId);
	}

	public getInfo() {
		return {
			id: this.id,
			name: this.name,
			players: this.players,
		};
	}
}
