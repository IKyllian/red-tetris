import { Game } from './game';
import { Piece } from './piece';
import { Player } from './player';

export class Lobby {
	public name: string;
	public id: string;
	public players: Player[] = [];
	private games: Game[] = [];
	private pieces: Piece[] = [];
	isStarted: boolean;
	constructor(name: string, playerName: string, playerId: string) {
		this.name = name;
		this.players.push(new Player(playerName, playerId, true));
		this.id = this.createRandomId();
	}

	private createRandomId(length: number = 5) {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
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

	public startGame() {
		for (let i = 0; i < 100; ++i) {
			this.pieces.push(new Piece());
		}
		for (const player of this.players) {
			this.games.push(new Game(player));
		}
	}
}
