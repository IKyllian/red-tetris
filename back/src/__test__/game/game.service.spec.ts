import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { BattleRoyal } from '../../game/battleRoyal';
import { GameSocketManager } from '../../game/game-socket-manager';
import { GameService } from '../../game/game.service';
import { SoloGame } from '../../game/solo-game';
import { GatewayService } from '../../gateway/gateway.service';
import { LeaderboardService } from '../../leaderboard/leaderboard.service';
import { LobbyService } from '../../lobby/lobby.service';
import { InputsPacketDto } from '../../utils/dto/gateway.dto';
import { Commands } from '../../type/command.types';

jest.mock('../../game/battleRoyal');
jest.mock('../../game/solo-game');

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

			const inputPacket: InputsPacketDto = {
				input: Commands.MOVE_DOWN,
			};
			gameService.pushInputs('socketId', inputPacket.input);

			expect(game.pushInputsInQueue).toHaveBeenCalledWith(
				inputPacket.input
			);
		});
	});
});
