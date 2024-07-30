import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { GatewayService } from '../gateway/gateway.service';
import { LobbyService } from '../lobby/lobby.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { GameSocketManager } from './game-socket-manager';
import { BattleRoyal } from './battleRoyal';
import { SoloGame } from './solo-game';
import { Socket } from 'socket.io';
import {
	InputsPacketDto,
	TickAdjustmentPacketDto,
} from '../utils/dto/gateway.dto';
import { SocketEvent } from '../type/event.enum';
import { ITickAdjustmentPacket } from '../type/event.enum';

jest.mock('./battleRoyal');
jest.mock('./solo-game');

describe('GameService', () => {
	let gameService: GameService;

	const mockGatewayService = {
		server: {
			to: jest.fn().mockReturnThis(),
			emit: jest.fn(),
		},
	};

	const mockLobbyService = {
		getLobby: jest.fn(),
	};

	const mockLeaderboardService = {
		// mock leaderboard service methods if necessary
	};

	const mockSocket: Partial<Socket> = {
		id: 'socketId',
		emit: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GameService,
				{ provide: GatewayService, useValue: mockGatewayService },
				{ provide: LobbyService, useValue: mockLobbyService },
				{
					provide: LeaderboardService,
					useValue: mockLeaderboardService,
				},
			],
		}).compile();

		gameService = module.get<GameService>(GameService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('startGame', () => {
		it('should start a battle royal game if lobby exists, game not started, and player is leader', () => {
			const lobby = {
				gameStarted: false,
				players: [{ id: 'socketId', isLeader: true }],
				getPlayer: jest
					.fn()
					.mockReturnValue({ id: 'socketId', isLeader: true }),
			};
			mockLobbyService.getLobby.mockReturnValue(lobby);

			gameService.startGame('socketId', 'playerName');

			expect(mockLobbyService.getLobby).toHaveBeenCalledWith('socketId');
			expect(lobby.getPlayer).toHaveBeenCalledWith('socketId');
			expect(BattleRoyal).toHaveBeenCalled();
		});

		it('should start a solo game if lobby does not exist or player is not the leader', () => {
			mockLobbyService.getLobby.mockReturnValue(undefined);

			gameService.startGame('socketId', 'playerName');

			expect(mockLobbyService.getLobby).toHaveBeenCalledWith('socketId');
			expect(SoloGame).toHaveBeenCalled();
		});
	});

	describe('leave', () => {
		it('should remove the player from the game and delete the game from socket map', () => {
			const mockGame = {
				leave: jest.fn(),
			};

			const gameSocketManager = new GameSocketManager();
			gameSocketManager.setGameToSocket('socketId', mockGame as any);

			(gameService as any).gameSocketMap = gameSocketManager;

			gameService.leave('socketId');

			expect(mockGame.leave).toHaveBeenCalledWith('socketId');
			expect(
				gameSocketManager.getGameFromSocket('socketId')
			).toBeUndefined();
		});
	});

	describe('pushInputs', () => {
		it('should push inputs to the player game input queue', () => {
			const game = {
				pushInputsInQueue: jest.fn(),
			};
			const mockGame: Partial<SoloGame> = {
				getPlayerGame: jest.fn().mockReturnValue(game),
			};

			const gameSocketManager = new GameSocketManager();
			gameSocketManager.setGameToSocket('socketId', mockGame as SoloGame);

			(gameService as any).gameSocketMap = gameSocketManager;

			const inputsPacket: InputsPacketDto = {
				inputs: [],
				tick: 0,
				adjustmentIteration: 0,
			};
			gameService.pushInputs('socketId', inputsPacket);

			expect(game.pushInputsInQueue).toHaveBeenCalledWith(inputsPacket);
		});
	});

	describe('syncWithServer', () => {
		it('should sync the game state with the server', () => {
			const mockGame = {
				adjustmentIteration: 0,
			};
			const mockGameLobby: Partial<SoloGame> = {
				getPlayerGame: jest.fn().mockReturnValue(mockGame),
				tick: 20,
			};

			const gameSocketManager = new GameSocketManager();
			gameSocketManager.setGameToSocket(
				'socketId',
				mockGameLobby as SoloGame
			);

			(gameService as any).gameSocketMap = gameSocketManager;

			const tickAdjustmentPacket: TickAdjustmentPacketDto = {
				tick: 19,
				adjustmentIteration: 0,
			};

			gameService.syncWithServer(
				mockSocket as Socket,
				tickAdjustmentPacket
			);

			const expectedPacket: ITickAdjustmentPacket = {
				tickAdjustment: 16,
				adjustmentIteration: 1,
			};

			expect(mockSocket.emit).toHaveBeenCalledWith(
				SocketEvent.SyncWithServer,
				expectedPacket
			);
		});
	});
});
