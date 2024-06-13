import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { LobbyModule } from './lobby/lobby.module';

@Module({
	imports: [
		GameModule,
		LobbyModule,
		// ServeStaticModule.forRoot({
		//   rootPath: '/home/kdelport/Documents/red-tetris/front/dist',
		// }),
	],
})
export class AppModule {
	constructor() {
		console.log('AppModule created');
	}
}
