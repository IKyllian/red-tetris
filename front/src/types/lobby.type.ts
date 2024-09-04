import { IGame } from 'front/types/board.types';
import { IPlayer } from 'front/types/player.type';

export interface ILobby {
	name: string;
	id: string;
	players: IPlayer[];
	gameStarted: boolean;
	maxPlayers: number;
	leaderboard: IPlayer[] | null;
}
