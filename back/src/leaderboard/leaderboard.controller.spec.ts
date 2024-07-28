import { Test, TestingModule } from '@nestjs/testing';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';

describe('LeaderboardController', () => {
	let controller: LeaderboardController;
	const mockTopTen = [
		{
			id: 1,
			playerName: 'test',
			score: 100,
		},
		{
			id: 2,
			playerName: 'test2',
			score: 200,
		},
	];
	const mockLeaderboardService = {
		getTopTen: jest.fn(() => Promise.resolve(mockTopTen)),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [LeaderboardController],
			providers: [LeaderboardService],
		})
			.overrideProvider(LeaderboardService)
			.useValue(mockLeaderboardService)
			.compile();

		controller = module.get<LeaderboardController>(LeaderboardController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('should return top ten leaderboard entries', async () => {
		expect(await controller.getLeaderboard()).toEqual(mockTopTen);
	});
});
