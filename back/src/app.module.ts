import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module';
import { LobbyModule } from './lobby/lobby.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Leaderboard } from './entity/leaderboard.entity';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { GatewayModule } from './gateway/gateway.module';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: process.env.POSTGRES_HOST,
			port: 5432,
			username: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			database: process.env.POSTGRES_DB,
			entities: [Leaderboard],
			synchronize: true,
			dropSchema: true,
		}),

		GatewayModule,
		GameModule,
		LobbyModule,
		LeaderboardModule,
		ServeStaticModule.forRoot({
		  rootPath: process.env.FRONT_DIST_PATH
		}),
	],
})
export class AppModule {
	constructor() {}
}
