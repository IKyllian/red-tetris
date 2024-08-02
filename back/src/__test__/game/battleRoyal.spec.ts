import { Server } from 'socket.io';
import { BattleRoyal } from '../../game/battleRoyal';
import { Player } from '../../game/player';
import { LeaderboardService } from '../../leaderboard/leaderboard.service';
import { Lobby } from '../../lobby/lobby';
import { SocketEvent } from '../../type/event.enum';
import { GameMode } from '../../type/game.type';
import { IIndestructiblePacket } from '../../type/packet.type';

describe('battleRoyal', () => {
	const mockPlayer = {
		id: 'test',
		name: 'test',
	};

	const mockServer = {
		to: jest.fn().mockReturnThis(),
		emit: jest.fn(),
	};

	const mockLeaderboardService = {
		create: jest.fn(),
	};
	let battleRoyal: BattleRoyal;
	let player: Player;
	let server: Server;
	let leaderboardService: LeaderboardService;

	beforeEach(() => {
		player = mockPlayer as any;
		server = mockServer as any;
		leaderboardService = mockLeaderboardService as any;
		const lobby = new Lobby('lobbyTest', 'playerTest', 'playerTestId');
		lobby.addPlayer('player2', 'player2');
		battleRoyal = new BattleRoyal(lobby, server);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('createRandomSeed', () => {
		it('should create a random seed of the specified length', () => {
			const length = 10;
			const seed = battleRoyal['createRandomSeed'](length);

			expect(typeof seed).toBe('string');
			expect(seed).toHaveLength(length);
			const allowedChars =
				'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
			for (const char of seed) {
				expect(allowedChars).toContain(char);
			}
		});

		it('should create a random seed of the default length when no length is provided', () => {
			const defaultLength = 20;
			const seed = battleRoyal['createRandomSeed']();

			expect(typeof seed).toBe('string');
			expect(seed).toHaveLength(defaultLength);
			const allowedChars =
				'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
			for (const char of seed) {
				expect(allowedChars).toContain(char);
			}
		});
	});

	describe('getPlayerGame', () => {
		it('should return the correct player game', () => {
			expect(battleRoyal.getPlayerGame('player2')).toEqual(
				battleRoyal.games[1]
			);
		});

		it('should return undefined if the player does not exist', () => {
			expect(battleRoyal.getPlayerGame('player777')).toBeUndefined();
		});
	});

	describe('leave', () => {
		it('should leave the game of the player id', () => {
			battleRoyal.leave('player2');
			expect(battleRoyal.games[1].hasQuit).toBe(true);
		});

		it('should does nothing if the player id does not exist', () => {
			battleRoyal.leave('777');
			expect(battleRoyal.games[1].hasQuit).toBe(false);
			expect(battleRoyal.games[1].hasQuit).toBe(false);
		});
	});

	describe('start', () => {
		it('should start the game', () => {
			const updateSpy = jest
				.spyOn(battleRoyal as any, 'update')
				.mockImplementation(() => {});
			battleRoyal.start();

			battleRoyal.games.forEach((game) => {
				const filteredData = battleRoyal.games.filter(
					(elem) => elem.player.id != game.player.id
				);
				const dataToSend = filteredData.map((data) =>
					data.getDataToSend()
				);
				const playerGameFound = battleRoyal.games.find(
					(elem) => elem.player.id === game.player.id
				);

				const playerGame = playerGameFound.getDataToSend();
				expect(battleRoyal.lobby.gameStarted).toBe(true);
				expect(server.to).toHaveBeenCalledWith(game.player.id);
				expect(server.emit).toHaveBeenCalledWith(
					SocketEvent.StartingGame,
					{
						playerGame: playerGame,
						gameMode: GameMode.BATTLEROYAL,
						seed: battleRoyal.seed,
						opponentsGames: dataToSend,
					}
				);

				expect(updateSpy).toHaveBeenCalled();
			});
		});
	});

	describe('handleIndestructibleLine', () => {
		it('should give the correct number of indestructible lines to other players', () => {
			const indestructibleToGive = 3;
			battleRoyal.games[1].indestructibleToGive = indestructibleToGive;
			battleRoyal['handleIndestructibleLine'](battleRoyal.games[1]);
			const maxTickOffset = battleRoyal.games.reduce(
				(acc, game) => Math.max(acc, game.tickAdjustment),
				0
			);
			const tickOffset = battleRoyal.tick + maxTickOffset + 30;
			const indestructiblePacket: IIndestructiblePacket = {
				tick: tickOffset,
				nb: indestructibleToGive,
			};
			expect(server.to).toHaveBeenCalledWith(
				battleRoyal.games[0].player.id
			);
			expect(server.emit).toHaveBeenCalledWith(
				SocketEvent.IndestructibleLine,
				indestructiblePacket
			);
			expect(battleRoyal.games[1].indestructibleToGive).toBe(0);
		});

		it('should emit nothing because the second player is game over', () => {
			const indestructibleToGive = 3;
			battleRoyal.games[1].indestructibleToGive = indestructibleToGive;
			battleRoyal.games[0].gameOver = true;
			battleRoyal['handleIndestructibleLine'](battleRoyal.games[1]);
			expect(server.to).not.toHaveBeenCalled();
			expect(server.emit).not.toHaveBeenCalled();
			expect(battleRoyal.games[1].indestructibleToGive).toBe(0);
		});
	});

	describe('sendUpdates', () => {
		it('should send updates', () => {
			battleRoyal.games[0].boardChanged = true;
			battleRoyal.games[1].positionChanged = true;
			battleRoyal['sendUpdates']();
			expect(server.to).toHaveBeenCalledTimes(2);
			expect(server.emit).toHaveBeenCalledTimes(2);
		});

		it('should send one time ', () => {
			battleRoyal.games[0].boardChanged = true;
			battleRoyal.games[1].hasQuit = true;
			battleRoyal['sendUpdates']();
			expect(server.to).toHaveBeenCalledTimes(1);
			expect(server.emit).toHaveBeenCalledTimes(1);
		});

		it('should send 0 time ', () => {
			battleRoyal.games[1].hasQuit = true;
			battleRoyal['sendUpdates']();
			expect(server.to).not.toHaveBeenCalled();
			expect(server.emit).not.toHaveBeenCalled();
		});
	});

	describe('checkGameOver', () => {
		it('should return true when the game is over', () => {
			battleRoyal.games[0].gameOver = true;
			battleRoyal['ranking'].unshift(battleRoyal.games[0].player);
			expect(battleRoyal['checkGameOver']()).toBe(true);
			expect(battleRoyal.lobby.gameStarted).toBe(false);
			expect(battleRoyal['ranking']).toHaveLength(2);
			expect(server.to).toHaveBeenCalledWith(battleRoyal.lobby.id);
			expect(server.emit).toHaveBeenCalledWith(
				SocketEvent.GameOver,
				battleRoyal['ranking']
			);
		});

		it('should return false when the game is not over', () => {
			expect(battleRoyal['checkGameOver']()).toBe(false);
		});
	});
});
