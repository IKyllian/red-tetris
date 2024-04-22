import { Game } from 'src/game/game';
import { Player } from 'src/game/player';

export interface ILobby {
	id: string;
	name: string;
	players: Player[];
	// games: Game[];
}
