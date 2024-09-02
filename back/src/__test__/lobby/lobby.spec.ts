import { Lobby } from '../../lobby/lobby';

describe('lobby', () => {
	let lobby: Lobby;

	beforeEach(() => {
		lobby = new Lobby('Test Lobby', 'Test Player', 'testPlayerId');
	});

	describe('createRandomId', () => {
		it('should create a random seed of the specified length', () => {
			const length = 10;
			const seed = lobby['createRandomId'](length);

			expect(typeof seed).toBe('string');
			expect(seed).toHaveLength(length);
			const allowedChars =
				'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
			for (const char of seed) {
				expect(allowedChars).toContain(char);
			}
		});

		it('should create a random seed of the default length when no length is provided', () => {
			const defaultLength = 5;
			const seed = lobby['createRandomId']();

			expect(typeof seed).toBe('string');
			expect(seed).toHaveLength(defaultLength);
			const allowedChars =
				'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
			for (const char of seed) {
				expect(allowedChars).toContain(char);
			}
		});
	});

	describe('addPlayer', () => {
		it('should add player to the lobby', () => {
			lobby.addPlayer('player2', 'player2');
			expect(lobby.players.length).toBe(2);
		});

		it('should not add player to the lobby if player already exist', () => {
			lobby.addPlayer('Test Player', 'testPlayerId');
			expect(lobby.players.length).toBe(1);
		});

		it('should not add player to the lobby if player length >= maxPlayers', () => {
			for (let i = 0; i < lobby.maxPlayers + 1; i++) {
				lobby.addPlayer(`Player${i}`, `Player${i}`);
			}
			lobby.addPlayer('asdasdasd', 'asdasdasd');
			expect(lobby.players.length).toBe(10);
		});

		it('should not add player to the lobby if game started', () => {
			lobby.gameStarted = true;
			lobby.addPlayer('asdasdasd', 'asdasd');
			expect(lobby.players.length).toBe(1);
		});
	});

	describe('deletePlayer', () => {
		it('should remove player from the lobby', () => {
			lobby.addPlayer('player2', 'player2');
			expect(lobby.players.length).toBe(2);
			lobby.deletePlayer('player2');
			expect(lobby.players.length).toBe(1);
		});
	});

	describe('getPlayer', () => {
		it('should return player from the lobby', () => {
			lobby.addPlayer('player2', 'player2');
			const player = lobby.getPlayer('player2');
			expect(player).toBeTruthy();
			expect(player?.name).toBe('player2');
		});

		it('should return undefined if player does not exist in the lobby', () => {
			const player = lobby.getPlayer('player2');
			expect(player).toBeUndefined();
		});
	});

	describe('getInfos', () => {
		it('should return lobby info', () => {
			const info = lobby.getInfo();
			expect(info).toHaveProperty('id');
			expect(info).toHaveProperty('name');
			expect(info).toHaveProperty('players');
			expect(info).toHaveProperty('gameStarted');
			expect(info).toHaveProperty('maxPlayers');
		});
	});
});
