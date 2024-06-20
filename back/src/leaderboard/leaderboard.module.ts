import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardService } from './leaderboard.service';
import { Leaderboard } from 'src/entity/leaderboard.entity';
import { LeaderboardController } from './leaderboard.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Leaderboard])],
	providers: [LeaderboardService],
	controllers: [LeaderboardController],
	exports: [LeaderboardService],
})
export class LeaderboardModule {}
