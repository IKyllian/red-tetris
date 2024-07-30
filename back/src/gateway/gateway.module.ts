import { Module, forwardRef } from '@nestjs/common';
import { Gateway } from './gateway';
import { GatewayService } from './gateway.service';
import { LobbyModule } from 'src/lobby/lobby.module';
import { GameModule } from 'src/game/game.module';

@Module({
	imports: [LobbyModule, forwardRef(() => GameModule)],
	providers: [Gateway, GatewayService],
	exports: [GatewayService],
})
export class GatewayModule {}
