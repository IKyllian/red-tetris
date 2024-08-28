import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Leaderboard } from '../../entity/leaderboard.entity';
import { LeaderboardService } from '../../leaderboard/leaderboard.service';
import { Repository } from 'typeorm';

describe('LeaderboardService', () => {
	let service: LeaderboardService;
	let repository: Repository<Leaderboard>;

	const mockTopTen = [
		{
			id: 1,
			playerName: 'test',
			score: 200,
		},
		{
			id: 2,
			playerName: 'test2',
			score: 100,
		},
	];

	const mockLeaderboardRepository = {
		create: jest.fn().mockImplementation((dto) => dto),
		save: jest
			.fn()
			.mockImplementation((entry) =>
				Promise.resolve({ id: 1, ...entry })
			),
		find: jest.fn().mockResolvedValue(mockTopTen),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				LeaderboardService,
				{
					provide: getRepositoryToken(Leaderboard),
					useValue: mockLeaderboardRepository,
				},
			],
		}).compile();

		service = module.get<LeaderboardService>(LeaderboardService);
		repository = module.get<Repository<Leaderboard>>(
			getRepositoryToken(Leaderboard)
		);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should create a leaderboard entry', async () => {
		const entry = await service.create('test', 200);
		expect(entry).toEqual({
			id: expect.any(Number),
			playerName: 'test',
			score: 200,
		});
	});

	it('should return top ten leaderboard entries', async () => {
		expect(await service.getTopTen()).toEqual(mockTopTen);
		expect(repository.find).toHaveBeenCalledWith({
			order: {
				score: 'DESC',
			},
			take: 10,
		});
	});
});
