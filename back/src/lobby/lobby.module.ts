import { Module } from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { LobbyController } from './lobby.controller';

@Module({
	controllers: [LobbyController],
	providers: [LobbyService],
	exports: [LobbyService],
})
export class LobbyModule {}
