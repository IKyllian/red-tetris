import { Controller, Get } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
	constructor(private lbService: LeaderboardService) {}

	@Get()
	async getLeaderboard() {
		return await this.lbService.getTopTen();
	}
}
