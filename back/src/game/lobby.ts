import { Game, IGame } from './game';
import { Piece } from './piece';
import { Player } from './player';
import { Server } from 'socket.io';
import { SocketEvent } from 'src/type/event.enum';

export class Lobby {
	public name: string;
	public id: string;
	public gameStarted: boolean = false;
	public players: Player[] = [];
	public games: Game[] = [];

	private pieces: Piece[] = [];
	private tickRate: number = 1000 / 30;
	private gameInterval: NodeJS.Timeout | null = null;
	private dataToSend: IGame[] = [];
	private server: Server;
	private tick: number = 0;

	constructor(name: string, playerName: string, playerId: string) {
		this.name = name;
		this.players.push(new Player(playerName, playerId, true));
		this.id = this.createRandomId();
		console.log('Lobby created with id: ', this.id);
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

	private generatePieces(nb: number) {
		for (let i = 0; i < nb; ++i) {
			this.pieces.push(new Piece());
		}
	}

	private updateState() {
		let nbOfGamesOver = 0;

		this.dataToSend = [];
		for (const game of this.games) {
			if (!game.gameOver) {
				game.updateState();
				if (game.newPieceNeeded) {
					// generate new piece when needed
					if (this.pieces.length - game.nbOfpieceDown < 10) {
						this.generatePieces(50);
					}
					game.addPiece(this.pieces[game.nbOfpieceDown + 3]);
				} else if (game.destructibleLinesToGive > 0) {
					for (const otherGame of this.games) {
						if (otherGame.player.id !== game.player.id) {
							otherGame.addDestructibleLines(
								game.destructibleLinesToGive
							);
						}
					}
					game.destructibleLinesToGive = 0;
				}
			} else {
				nbOfGamesOver++;
			}
			this.dataToSend.push(game.getDataToSend());
		}
		this.server.to(this.id).emit(SocketEvent.GamesUpdate, this.dataToSend);
		if (this.games.length > 1 && nbOfGamesOver === this.games.length - 1) {
			this.stopGames();
		} else if (this.games.length === nbOfGamesOver) {
			this.stopGames();
		} else {
			this.gameInterval = setTimeout(
				this.updateState.bind(this),
				this.tickRate
			);
		}
		this.tick++;
	}

	public startGames(server: Server) {
		this.games = [];
		this.pieces = [];
		this.server = server;
		this.gameStarted = true;
		this.generatePieces(100);
		for (const player of this.players) {
			this.games.push(new Game(player, this.pieces, 0));
		}
		this.updateState();
	}

	public stopGames() {
		if (this.gameInterval !== null) {
			clearTimeout(this.gameInterval);
			this.gameInterval = null;
			console.log('Game stopped.');
		} else {
			console.log('The game is not currently running.');
		}
		this.gameStarted = false;
	}

	public getPlayer(playerId: string): Player | undefined {
		return this.players.find((player) => player.id === playerId);
	}

	public getPlayerGame(playerId: string): Game | undefined {
		return this.games.find((game) => game.player.id === playerId);
	}
}
