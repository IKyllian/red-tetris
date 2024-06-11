import { IGame } from 'src/game/game';
import { Piece } from 'src/game/piece';
import { Player } from 'src/game/player';

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
export interface IGameUpdatePacket {
	updateType: number;
	state: IGame | { player: Player; piece: Piece };
}

export interface IIndestructiblePacket {
	tick: number;
	nb: number;
}
