import { Player } from '../game/player';
import { Server } from 'socket.io';
import { BattleRoyal } from '../game/battleRoyal';
import { GameSocketManager } from '../game/game-socket-manager';

export class Lobby {
	public name: string;
	public id: string;
	public gameStarted: boolean = false;
	public players: Player[] = [];
	public game: BattleRoyal;
	public readonly maxPlayers = 10;

	constructor(name: string, playerName: string, playerId: string, lobbyId?: string) {
		this.name = name;
		this.players.push(new Player(playerName, playerId, true));
		this.id = lobbyId ?? this.createRandomId();
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
		if (
			this.players.length < this.maxPlayers &&
			this.gameStarted === false &&
			!this.players.find((player) => player.id === playerId)
		) {
			this.players.push(new Player(playerName, playerId));
		}
	}

	public deletePlayer(playerId: string) {
		this.players = this.players.filter(
			(player: Player) => player.id != playerId
		);
	}

	public startGame(server: Server, gameManager: GameSocketManager) {
		this.gameStarted = true;
		this.game = new BattleRoyal(this, server);
		this.game.start();
		this.players.forEach((player) => {
			gameManager.setGameToSocket(player.id, this.game);
		});
	}

	public getPlayer(playerId: string): Player | undefined {
		return this.players.find((player) => player.id === playerId);
	}

	// public getPlayerGame(playerId: string): Game | undefined {
	// 	return this.game.games.find((game) => game.player.id === playerId);
	// }

	public getInfo() {
		return {
			id: this.id,
			name: this.name,
			players: this.players,
			gameStarted: this.gameStarted,
			maxPlayers: this.maxPlayers,
		};
	}
}
