import { BattleRoyal } from './battleRoyal';
import { SoloGame } from './solo-game';

export class GameSocketManager {
	private readonly gameSocketMap: Map<string, BattleRoyal | SoloGame> =
		new Map();

	public setGameToSocket(socketId: string, game: BattleRoyal | SoloGame) {
		this.gameSocketMap.set(socketId, game);
	}

	public getGameFromSocket(
		socketId: string
	): BattleRoyal | SoloGame | undefined {
		return this.gameSocketMap.get(socketId);
	}

	public deleteGameFromSocket(socketId: string) {
		this.gameSocketMap.delete(socketId);
	}
}
