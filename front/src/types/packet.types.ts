import { IGame } from './board.types';
import { COMMANDS } from './command.types';
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

export interface IServerState {
	tick: number;
	packet: IGameUpdatePacket;
}

export interface IInputsPacket {
	tick: number;
	adjustmentIteration: number;
	inputs: COMMANDS[];
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
