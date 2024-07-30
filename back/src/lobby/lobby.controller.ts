import { Controller, Get } from '@nestjs/common';
import { LobbyService } from './lobby.service';

@Controller('lobby')
export class LobbyController {
	constructor(private LobbyService: LobbyService) {}

	@Get()
	getLobbies() {
		return this.LobbyService.getLobbies();
	}
}
