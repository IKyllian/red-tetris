import { Module } from '@nestjs/common';
import { LobbyManager } from './lobby-manager';
import { LobbyController } from './lobby.controller';

@Module({
	controllers: [LobbyController],
	providers: [LobbyManager],
	exports: [LobbyManager],
})
export class LobbyModule {}
