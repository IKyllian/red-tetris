import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameSocketManager } from './game-socket-manager';

@Module({
	providers: [GameGateway, GameSocketManager],
})
export class GameModule {}
