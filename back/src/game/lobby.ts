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
	private lastUpdate: number;

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

	private generatePieces(nb: number): Piece[] {
		let newPieces: Piece[] = [];
		for (let i = 0; i < nb; ++i) {
			newPieces.push(new Piece());
		}
		this.pieces = [...this.pieces, ...newPieces];
		return newPieces;
	}

	// private updateState() {
	// 	let nbOfGamesOver = 0;

	// 	this.dataToSend = [];
	// 	if (this.gameStarted === false) {
	// 		this.stopGames();
	// 		return;
	// 	}
	// 	for (const game of this.games) {
	// 		if (!game.gameOver) {
	// 			game.updateState();
	// 			if (game.newPieceNeeded) {
	// 				// generate new piece when needed
	// 				if (this.pieces.length - game.nbOfpieceDown < 10) {
	// 					this.generatePieces(50);
	// 				}
	// 				game.addPiece(this.pieces[game.nbOfpieceDown + 3]);
	// 			} else if (game.destructibleLinesToGive > 0) {
	// 				for (const otherGame of this.games) {
	// 					if (otherGame.player.id !== game.player.id) {
	// 						otherGame.addDestructibleLines(
	// 							game.destructibleLinesToGive
	// 						);
	// 					}
	// 				}
	// 				game.destructibleLinesToGive = 0;
	// 			}
	// 		} else {
	// 			nbOfGamesOver++;
	// 		}
	// 		this.dataToSend.push(game.getDataToSend());
	// 	}
	// 	this.server.to(this.id).emit(SocketEvent.GamesUpdate, this.dataToSend);
	// 	if (this.games.length > 1 && nbOfGamesOver === this.games.length - 1) {
	// 		this.stopGames();
	// 	} else if (this.games.length === nbOfGamesOver) {
	// 		this.stopGames();
	// 	} else {
	// 		this.gameInterval = setTimeout(
	// 			this.updateState.bind(this),
	// 			this.tickRate
	// 		);
	// 	}
	// 	this.tick++;
	// }

	private updateState() {
		this.dataToSend = [];
		if (this.gameStarted === false) {
			this.stopGames();
			return;
		}
		let deltaTime = performance.now() - this.lastUpdate;
		while (deltaTime >= this.tickRate) {
			let nbOfGamesOver = 0;
			for (const game of this.games) {
				if (
					this.games.length > 1 &&
					nbOfGamesOver === this.games.length - 1
				) {
					this.stopGames();
					return;
				} else if (this.games.length === nbOfGamesOver) {
					this.stopGames();
					return;
				}
				if (game.gameOver) {
					nbOfGamesOver++;
					continue;
				}
				game.updateState(this.tick);
				if (game.newPieceNeeded) {
					// generate new piece when needed
					if (this.pieces.length - game.nbOfpieceDown < 10) {
						const newPieces = this.generatePieces(50);
						this.server
							.to(this.id)
							.emit(SocketEvent.PiecesUpdate, newPieces);
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
			}
			deltaTime -= this.tickRate;
			this.tick++;
		}
		this.lastUpdate = performance.now();
		for (const game of this.games) {
			const filteredData = this.games.filter((elem) => {
				elem.player.id != game.player.id;
			});
			const dataToSend = filteredData.map((data) => {
				data.getDataToSend();
			});
			this.server
				.to(game.player.id)
				.emit(SocketEvent.GamesUpdate, dataToSend);
		}
		// for (const game of this.games) {
		// 	this.dataToSend.push(game.getDataToSend());
		// }
		// this.server.to(this.id).emit(SocketEvent.GamesUpdate, this.dataToSend);

		this.gameInterval = setTimeout(this.updateState.bind(this), 1000);
	}

	public startGames(server: Server) {
		this.games = [];
		this.pieces = [];
		this.server = server;
		this.gameStarted = true;
		this.generatePieces(100);
		this.dataToSend = [];
		let playerGame: IGame;
		for (const player of this.players) {
			this.games.push(new Game(player, this.pieces, 0));
		}
		for (const game of this.games) {
			const filteredData = this.games.filter((elem) => {
				elem.player.id != game.player.id;
			});
			const dataToSend = filteredData.map((data) => {
				data.getDataToSend();
			});
			this.server.to(game.player.id).emit(SocketEvent.StartingGame, {
				playerGame: playerGame,
				opponentsGames: dataToSend,
				pieces: this.pieces,
			});
		}
		this.lastUpdate = performance.now();
		this.updateState();
	}

	public cancelGames() {
		this.gameStarted = false;
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

	public getInfo() {
		return {
			id: this.id,
			name: this.name,
			players: this.players,
		};
	}
}
