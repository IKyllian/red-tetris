import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module';
import { LobbyModule } from './lobby/lobby.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Leaderboard } from './entity/leaderboard.entity';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: 'localhost',
			port: 5432,
			username: 'red_tetris_user',
			password: 'red_tetris_pwd',
			database: 'red_tetris',
			entities: [Leaderboard],
			synchronize: true,
			dropSchema: true,
		}),

		GatewayModule,
		GameModule,
		LobbyModule,
		LeaderboardModule,
		// ServeStaticModule.forRoot({
		//   rootPath: '/home/kdelport/Documents/red-tetris/front/dist',
		// }),
	],
})
export class AppModule {
	constructor() {}
}
