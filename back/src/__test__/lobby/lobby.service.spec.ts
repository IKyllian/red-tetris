import { Test, TestingModule } from '@nestjs/testing';
import { Socket, Server } from 'socket.io';
import { LobbyService } from '../../lobby/lobby.service';
import { SocketEvent } from '../../type/event.enum';

describe('LobbyService', () => {
	let service: LobbyService;
	let socket: Socket;
	let server: Server;

	const mockSocket = {
		id: 'socketId',
		join: jest.fn(),
		leave: jest.fn(),
		emit: jest.fn(),
		to: jest.fn().mockReturnThis(),
	};

	const mockServer = {
		to: jest.fn().mockReturnThis(),
		emit: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [LobbyService],
		}).compile();

		service = module.get<LobbyService>(LobbyService);
		socket = mockSocket as unknown as Socket;
		server = mockServer as unknown as Server;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('createLobby', () => {
		it('should create a lobby and emit UpdateLobby event', () => {
			const playerName = 'Player1';
			const lobbyName = 'TestLobby';

			service.createLobby(socket, playerName, lobbyName);

			expect(service.getLobby(socket.id)).toBeDefined();
			expect(socket.join).toHaveBeenCalledWith(expect.any(String));
			expect(socket.emit).toHaveBeenCalledWith(
				SocketEvent.UpdateLobby,
				expect.any(Object)
			);
		});

		it('should truncate lobby name if longer than 20 characters', () => {
			const playerName = 'Player1';
			const lobbyName =
				'ThisIsAVeryLongLobbyNameThatExceedsTwentyCharacters';

			service.createLobby(socket, playerName, lobbyName);

			const truncatedLobbyName = lobbyName.substring(0, 20);
			const lobby = service.getLobby(socket.id);

			expect(lobby.name).toBe(truncatedLobbyName);
		});
	});

	describe('joinLobby', () => {
		it('should allow a player to join an existing lobby', () => {
			const playerName = 'Player1';
			const lobbyName = 'TestLobby';

			service.createLobby(socket, playerName, lobbyName);

			const lobby = service.getLobby(socket.id);
			const newSocket = {
				...mockSocket,
				id: 'newSocketId',
			} as unknown as Socket;

			service.joinLobby(newSocket, 'Player2', lobby.id, server);

			expect(newSocket.join).toHaveBeenCalledWith(lobby.id);
			expect(lobby.players).toHaveLength(2);
			expect(server.to(lobby.id).emit).toHaveBeenCalledWith(
				SocketEvent.UpdateLobby,
				expect.any(Object)
			);
		});

		it('should not allow a player to join a non-existent lobby if createLobbyIfNotExists is false', () => {
			const newSocket = {
				...mockSocket,
				id: 'newSocketId',
			} as unknown as Socket;

			service.joinLobby(
				newSocket,
				'Player2',
				'nonExistentLobbyId',
				server
			);

			expect(newSocket.join).not.toHaveBeenCalled();
			expect(service.getLobby(newSocket.id)).toBeUndefined();
		});

		it('should allow a player to create a non-existent lobby if createLobbyIfNotExists is true', () => {
			const newSocket = {
				...mockSocket,
				id: 'newSocketId',
			} as unknown as Socket;

			const lobbyId = 'nonExistentLobbyId'
			service.joinLobby(
				newSocket,
				'Player2',
				lobbyId,
				server,
				true
			);


			expect(service.getLobby(newSocket.id)).toBeDefined();
			expect(newSocket.join).toHaveBeenCalledWith(lobbyId);
			expect(socket.emit).toHaveBeenCalledWith(
				SocketEvent.UpdateLobby,
				expect.any(Object)
			);
		});

		it('should not allow a player to join a full lobby', () => {
			const playerName = 'Player1';
			const lobbyName = 'TestLobby';

			service.createLobby(socket, playerName, lobbyName);

			const lobby = service.getLobby(socket.id);

			for (let i = 0; i < lobby.maxPlayers + 2; i++) {
				service.joinLobby(
					{
						...mockSocket,
						id: `newSocketId${i}`,
					} as unknown as Socket,
					`Player${i}`,
					lobby.id,
					server
				);
			}
			expect(lobby.players).toHaveLength(lobby.maxPlayers);
		});

		it('should not allow a player to join a lobby if the game has already started', () => {
			const playerName = 'Player1';
			const lobbyName = 'TestLobby';

			service.createLobby(socket, playerName, lobbyName);

			const lobby = service.getLobby(socket.id);
			lobby.gameStarted = true;

			const newSocket = {
				...mockSocket,
				id: 'newSocketId',
			} as unknown as Socket;

			service.joinLobby(newSocket, 'Player2', lobby.id, server);
			expect(service.getLobby(newSocket.id)).toBeUndefined();
		});
	});

	describe('leave', () => {
		it('should remove a player from the lobby and emit UpdateLobby event', () => {
			const playerName = 'Player1';
			const lobbyName = 'TestLobby';

			service.createLobby(socket, playerName, lobbyName);

			const lobby = service.getLobby(socket.id);

			service.leave(socket);

			expect(socket.leave).toHaveBeenCalledWith(lobby.id);
			expect(service.getLobby(socket.id)).toBeUndefined();
		});

		it('should delete the lobby if the last player leaves', () => {
			const playerName = 'Player1';
			const lobbyName = 'TestLobby';

			service.createLobby(socket, playerName, lobbyName);
			service.leave(socket);

			expect(service.getLobby(socket.id)).toBeUndefined();
			expect(service.getLobbies()).toHaveLength(0);
		});

		it('should assign leader to the first player if the leader leaves', () => {
			const playerName1 = 'Player1';
			const playerName2 = 'Player2';
			const lobbyName = 'TestLobby';

			service.createLobby(socket, playerName1, lobbyName);
			const newSocket = {
				...mockSocket,
				id: 'newSocketId',
			} as unknown as Socket;

			service.joinLobby(
				newSocket,
				playerName2,
				service.getLobby(socket.id).id,
				server
			);

			service.leave(socket);

			const lobby = service.getLobby(newSocket.id);

			expect(lobby.players[0].isLeader).toBe(true);
		});
	});

	describe('getLobby', () => {
		it('should return the lobby for a given socket id', () => {
			const playerName = 'Player1';
			const lobbyName = 'TestLobby';

			service.createLobby(socket, playerName, lobbyName);

			const lobby = service.getLobby(socket.id);

			expect(lobby).toBeDefined();
			expect(lobby.name).toBe(lobbyName);
		});
	});

	describe('getLobbies', () => {
		it('should return all lobbies', () => {
			service.createLobby(socket, 'Player1', 'Lobby1');
			const newSocket = {
				...mockSocket,
				id: 'newSocketId',
			} as unknown as Socket;
			service.createLobby(newSocket, 'Player2', 'Lobby2');

			const lobbies = service.getLobbies();

			expect(lobbies).toHaveLength(2);
		});
	});
});
