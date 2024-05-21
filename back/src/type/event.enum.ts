import { COMMANDS } from './command.types';

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
	PiecesUpdate = 'pieces-update',
	GameOver = 'game-over',
	// On events
	Error = 'error',
}

export interface IInputsPacket {
	tick: number;
	inputs: COMMANDS[];
}
