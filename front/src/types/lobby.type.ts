import { IGame } from 'front/types/board.types';
import { IPlayer } from 'front/types/player.type';

export interface ILobby {
	name: string;
	id: string;
	players: IPlayer[];
	// games: IGame[];
	// seed: string;
	gameStarted: boolean;
	maxPlayers: number;
	// playerGame?: IGame;
	// opponentsGames: IGame[];
	// gamesOver: boolean;
	leaderboard: IPlayer[] | null;
}
