import { Module } from '@nestjs/common';
import { LobbyModule } from 'src/lobby/lobby.module';
import { GameService } from './game.service';
import { GatewayModule } from 'src/gateway/gateway.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Leaderboard } from 'src/entity/leaderboard.entity';
import { LeaderboardModule } from 'src/leaderboard/leaderboard.module';

@Module({
	imports: [LobbyModule, GatewayModule, LeaderboardModule],
	providers: [GameService],
	exports: [GameService],
})
export class GameModule {}
