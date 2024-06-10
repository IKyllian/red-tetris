import { IGame } from 'front/types/board.types';
import { COMMANDS } from 'front/types/command.types';
import { IPlayer } from 'front/types/player.type';
import { ITetromino } from 'front/types/tetrominoes.type';

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

export interface ITickAdjustmentPacket {
	tickAdjustment: number;
	adjustmentIteration: number;
}

export interface IIndestructiblePacket {
	tick: number;
	nb: number;
}

export enum GameMode {
	SOLO,
	BATTLEROYAL,
}
