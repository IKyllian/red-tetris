import { BadRequestException, Controller, Get } from '@nestjs/common';
import { LobbyManager } from './lobby-manager';

@Controller('lobby')
export class LobbyController {
	constructor(private lobbyManager: LobbyManager) {}

	@Get()
	getLobbies() {
		return this.lobbyManager.getLobbies();
	}
}
