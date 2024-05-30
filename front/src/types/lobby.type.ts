import { IGame } from './board.types';
import { IPlayer } from './player.type';

export interface ILobby {
	name: string;
	id: string;
	players: IPlayer[];
	// games: IGame[];
	// seed: string;
	gameStarted: boolean;
	// playerGame?: IGame;
	// opponentsGames: IGame[];
	// gamesOver: boolean;
	// leaderboard: IPlayer[];
}

export const defaultLobby: ILobby = {
	name: '',
	id: '',
	players: [],
	// games: [],
	// seed: '',
	gameStarted: false,
	// opponentsGames: [],
	// playerGame: null,
	// gamesOver: false,
	// leaderboard: [],
};
