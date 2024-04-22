import { COMMANDS } from 'src/type/command.types';
import { Game, IGame } from './game';
import { Piece } from './piece';
import { Player } from './player';
import { Server } from 'socket.io';
import { ILobby } from 'src/type/lobby.interface';
import { SocketEvent } from 'src/type/event.enum';

export class Lobby {
	public name: string;
	public id: string;
	public gameStarted: boolean = false;
	public players: Player[] = [];
	public games: Game[] = [];

	private pieces: Piece[] = [];
	private tickRate: number = 100;
	private gameInterval: NodeJS.Timeout | null = null;
	private downInterval: NodeJS.Timeout | null = null;
	private dataToSend: IGame[] = [];

	constructor(name: string, playerName: string, playerId: string) {
		this.name = name;
		this.players.push(new Player(playerName, playerId, true));
		this.id = this.createRandomId();
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

	public startGames(server: Server) {
		let nbOfGamesOver = 0;
		this.games = [];
		this.pieces = [];
		this.gameStarted = true;
		this.generatePieces(100);
		for (const player of this.players) {
			this.games.push(new Game(player, this.pieces));
		}
		if (this.gameInterval === null) {
			this.gameInterval = setInterval(() => {
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
						}
					} else {
						nbOfGamesOver++;
					}
					//TODO: send only game that are not over ?
					this.dataToSend.push(game.getDataToSend());
				}
				server
					.to(this.id)
					.emit(SocketEvent.GamesUpdate, this.dataToSend);
				if (nbOfGamesOver === this.games.length) {
					this.stopGames();
				}
			}, this.tickRate);
		} else {
			console.log('The game is already running.');
		}
	}

	public stopGames() {
		if (this.gameInterval !== null) {
			clearInterval(this.gameInterval);
			for (const game of this.games) {
				game.clearInterval();
			}
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
