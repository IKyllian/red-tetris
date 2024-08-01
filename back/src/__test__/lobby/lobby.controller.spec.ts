import { Test, TestingModule } from '@nestjs/testing';
import { LobbyController } from '../../lobby/lobby.controller';
import { LobbyService } from '../../lobby/lobby.service';
import { ILobby } from '../../type/lobby.interface';

describe('LobbyController', () => {
	let controller: LobbyController;
	let service: LobbyService;

	const mockLobbyService = {
		getLobbies: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [LobbyController],
			providers: [
				{
					provide: LobbyService,
					useValue: mockLobbyService,
				},
			],
		}).compile();

		controller = module.get<LobbyController>(LobbyController);
		service = module.get<LobbyService>(LobbyService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('getLobbies', () => {
		it('should return an array of lobbies', () => {
			const result: ILobby[] = [
				{ id: '1', name: 'Lobby1', players: [] },
				{ id: '2', name: 'Lobby2', players: [] },
			];
			mockLobbyService.getLobbies.mockReturnValue(result);

			expect(controller.getLobbies()).toBe(result);
			expect(service.getLobbies).toHaveBeenCalled();
		});
	});
});
