import { Player } from '../game/player';

export interface ILobby {
	id: string;
	name: string;
	players: Player[];
}
