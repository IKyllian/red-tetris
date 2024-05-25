import { IGame } from './board.types';
import { IPlayer } from './player.type';
import { ITetromino } from './tetrominoes.type';

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

export interface IGameUpdatePacketHeader {
	tick: number;
	tickAdjustment: number;
	adjustmentIteration: number;
	gamePackets: IGameUpdatePacket[];
}
