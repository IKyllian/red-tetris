import { Commands } from './command.types';

export enum SocketEvent {
	Connect = 'connect',
	Disconnect = 'disconnect',
	// Emit events
	CreateLobby = 'create-lobby',
	JoinLobby = 'join-lobby',
	UpdateLobby = 'update-lobby',
	LeaveLobby = 'leave-lobby',
	BoardUpdate = 'board-update',
	CommandPressed = 'command-pressed',
	StartGame = 'start-game',
	GameReady = 'game-ready',
	StopGame = 'stop-game',
	GamesUpdate = 'games-update',
	StartingGame = 'starting-game',
	LeaveGame = 'leave-game',
	GameOver = 'game-over',
	IndestructibleLine = 'indestructible-line',
	SyncWithServer = 'sync',
}

export interface IInputsPacket {
	tick: number;
	adjustmentIteration: number;
	inputs: Commands[];
}

export interface ITickAdjustmentPacket {
	tickAdjustment: number;
	adjustmentIteration: number;
}
