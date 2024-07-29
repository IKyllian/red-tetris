import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Leaderboard } from '../entity/leaderboard.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LeaderboardService {
	constructor(
		@InjectRepository(Leaderboard)
		private readonly leaderboardRepository: Repository<Leaderboard>
	) {}

	async create(playerName: string, score: number): Promise<Leaderboard> {
		const leaderboardEntry = this.leaderboardRepository.create({
			playerName,
			score,
		});
		return this.leaderboardRepository.save(leaderboardEntry);
	}

	getTopTen(): Promise<Leaderboard[]> {
		return this.leaderboardRepository.find({
			order: {
				score: 'DESC',
			},
			take: 10,
		});
	}
}
