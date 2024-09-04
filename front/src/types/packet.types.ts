import { IGame } from 'front/types/board.types';
import { IPlayer } from 'front/types/player.type';
import { ITetromino } from 'front/types/tetrominoes.type';
import { Commands } from './command.types';

export interface IPositionUpdate {
	player: IPlayer;
	piece: ITetromino;
}
export interface IGameUpdatePacket {
	updateType: UpdateType;
	state: IGame | IPositionUpdate;
}

export enum UpdateType {
	POSITION = 1,
	GAME,
}

export enum GameMode {
	SOLO,
	BATTLEROYAL,
}
