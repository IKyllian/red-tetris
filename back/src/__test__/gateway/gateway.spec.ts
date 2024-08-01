import { Test, TestingModule } from '@nestjs/testing';
import { Socket, Server } from 'socket.io';
import { GameService } from '../../game/game.service';
import { Gateway } from '../../gateway/gateway';
import { GatewayService } from '../../gateway/gateway.service';
import { LobbyService } from '../../lobby/lobby.service';
import {
	CreateLobbyDto,
	JoinLobbyDto,
	StartGameDto,
	InputsPacketDto,
	TickAdjustmentPacketDto,
} from '../../utils/dto/gateway.dto';

describe('Gateway', () => {
	let gateway: Gateway;
	let server: Server;
	let socket: Socket;
	let lobbyService: LobbyService;
	let gameService: GameService;

	const mockServer = {
		to: jest.fn().mockReturnThis(),
		emit: jest.fn(),
	};

	const mockSocket = {
		id: 'socketId',
		join: jest.fn(),
		leave: jest.fn(),
		emit: jest.fn(),
		to: jest.fn().mockReturnThis(),
	};

	const mockLobbyService = {
		getLobby: jest.fn(),
		createLobby: jest.fn(),
		joinLobby: jest.fn(),
		leave: jest.fn(),
	};

	const mockGameService = {
		startGame: jest.fn(),
		pushInputs: jest.fn(),
		syncWithServer: jest.fn(),
		leave: jest.fn(),
	};

	const mockGatewayService = {
		server: undefined,
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				Gateway,
				{ provide: GatewayService, useValue: mockGatewayService },
				{ provide: LobbyService, useValue: mockLobbyService },
				{ provide: GameService, useValue: mockGameService },
			],
		}).compile();

		gateway = module.get<Gateway>(Gateway);
		server = mockServer as unknown as Server;
		socket = mockSocket as unknown as Socket;
		lobbyService = module.get<LobbyService>(LobbyService);
		gameService = module.get<GameService>(GameService);

		gateway.server = server;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(gateway).toBeDefined();
	});

	describe('handleConnection', () => {
		it('should handle connection', async () => {
			expect(gateway.handleConnection(socket)).toBeUndefined();
		});
	});

	describe('handleDisconnect', () => {
		it('should handle disconnect', async () => {
			gateway.handleDisconnect(socket);
			expect(lobbyService.leave).toHaveBeenCalledWith(socket);
			expect(gameService.leave).toHaveBeenCalledWith(socket.id);
		});
	});

	describe('createLobby', () => {
		it('should create a lobby', () => {
			const data: CreateLobbyDto = {
				playerName: 'Player1',
				name: 'Lobby1',
			};

			mockLobbyService.getLobby.mockReturnValueOnce(undefined);

			gateway.createLobby(socket, data);

			expect(lobbyService.getLobby).toHaveBeenCalledWith(socket.id);
			expect(lobbyService.createLobby).toHaveBeenCalledWith(
				socket,
				data.playerName,
				data.name
			);
		});
	});

	describe('joinLobby', () => {
		it('should join a lobby', () => {
			const data: JoinLobbyDto = {
				playerName: 'Player1',
				lobbyId: 'lobbyId',
			};

			gateway.joinLobby(socket, data);

			expect(lobbyService.leave).toHaveBeenCalledWith(socket);
			expect(gameService.leave).toHaveBeenCalledWith(socket.id);
			expect(lobbyService.joinLobby).toHaveBeenCalledWith(
				socket,
				data.playerName,
				data.lobbyId,
				server
			);
		});
	});

	describe('leaveLobby', () => {
		it('should leave a lobby', () => {
			gateway.leaveLobby(socket);

			expect(lobbyService.leave).toHaveBeenCalledWith(socket);
		});
	});

	describe('startGame', () => {
		it('should start a game', () => {
			const data: StartGameDto = { playerName: 'Player1' };

			gateway.startGame(socket, data);

			expect(gameService.startGame).toHaveBeenCalledWith(
				socket.id,
				data.playerName
			);
		});
	});

	describe('commandPressed', () => {
		it('should handle command pressed', () => {
			const data: InputsPacketDto = {
				tick: 10,
				inputs: [],
				adjustmentIteration: 0,
			};

			gateway.commandPressed(socket, data);

			expect(gameService.pushInputs).toHaveBeenCalledWith(
				socket.id,
				data
			);
		});
	});

	describe('syncWithServer', () => {
		it('should handle sync with server', () => {
			const data: TickAdjustmentPacketDto = {
				tick: 10,
				adjustmentIteration: 0,
			};

			gateway.syncWithServer(socket, data);

			expect(gameService.syncWithServer).toHaveBeenCalledWith(
				socket,
				data
			);
		});
	});

	describe('leaveGame', () => {
		it('should leave a game', () => {
			gateway.leaveGame(socket);

			expect(gameService.leave).toHaveBeenCalledWith(socket.id);
		});
	});
});
