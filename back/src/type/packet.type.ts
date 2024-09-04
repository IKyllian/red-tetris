import { IGame } from 'src/game/game';
import { Piece } from 'src/game/piece';
import { Player } from 'src/game/player';

export enum UpdateType {
	POSITION = 1,
	GAME,
}

export interface IGameUpdatePacket {
	updateType: UpdateType;
	state: IGame | { player: Player; piece: Piece };
}

export interface IIndestructiblePacket {
	tick: number;
	nb: number;
}
