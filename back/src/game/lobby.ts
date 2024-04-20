import { COMMANDS } from 'src/type/command.types';
import { Game } from './game';
import { Piece } from './piece';
import { Player } from './player';
import { Server } from 'socket.io';

export class Lobby {
	public name: string;
	public id: string;
	public gameStarted: boolean = false;
	public players: Player[] = [];

	private games: Game[] = [];
	private pieces: Piece[] = [];
	private tickRate: number = 500;
	private gameInterval: NodeJS.Timeout | null = null;
	private downInterval: NodeJS.Timeout | null = null;

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

	public startGames(server: Server) {
		for (let i = 0; i < 100; ++i) {
			this.pieces.push(new Piece());
		}
		for (const player of this.players) {
			this.games.push(new Game(player, this.pieces));
		}
		if (this.gameInterval === null) {
			this.gameInterval = setInterval(() => {
				for (const game of this.games) {
					game.updateState();
					if (game.newPieceNeeded) {
						//TODO: generate new piece when needed
						game.addPiece(this.pieces[game.nbOfpieceDown + 3]);
					}
				}
				server.to(this.id).emit('update', this.games);
			}, this.tickRate);
			this.downInterval = setInterval(() => {
				for (const game of this.games) {
					game.handleCommand(COMMANDS.KEY_DOWN);
				}
			}, 1000);
			this.gameStarted = true;
		} else {
			console.log('The game is already running.');
		}
	}

	public stopGames() {
		if (this.gameInterval !== null) {
			clearInterval(this.gameInterval);
			clearInterval(this.downInterval);
			this.gameInterval = null;
			console.log('Game stopped.');
		} else {
			console.log('The game is not currently running.');
		}
		this.gameStarted = false;
	}

	public getPlayerGame(playerId: string): Game | undefined {
		return this.games.find((game) => game.player.id === playerId);
	}
}
