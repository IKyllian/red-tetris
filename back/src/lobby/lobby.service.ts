import { SocketEvent } from '../type/event.enum';
import { Socket, Server } from 'socket.io';
import { ILobby } from '../type/lobby.interface';
import { Lobby } from './lobby';
import { BadRequestException, Injectable } from '@nestjs/common';
@Injectable()
export class LobbyService {
	private socketRoomMap: Map<string, string> = new Map(); // Map<socketId, roomName>
	private lobbys: Map<string, Lobby> = new Map();

	public createLobby(
		socket: Socket,
		playerName: string,
		lobbyName: string,
		lobbyId?: string
	) {
		if (lobbyName.length === 0) {
			lobbyName = 'Lobby';
		} else if (lobbyName.length > 20) {
			lobbyName = lobbyName.substring(0, 20);
		}
		const lobby = new Lobby(lobbyName, playerName, socket.id, lobbyId);
		this.lobbys.set(lobby.id, lobby);
		socket.join(lobby.id);
		this.socketRoomMap.set(socket.id, lobby.id);
		socket.emit(SocketEvent.UpdateLobby, lobby);
	}

	public joinLobby(
		socket: Socket,
		playerName: string,
		lobbyId: string,
		server: Server,
		createLobbyIfNotExists: boolean = false
	) {
		const lobby: Lobby | undefined = this.lobbys.get(lobbyId);
		if (!lobby && createLobbyIfNotExists) {
			this.createLobby(
				socket,
				playerName,
				`Lobby de ${playerName}`,
				lobbyId
			);
		} else if (
			lobby &&
			lobby.gameStarted === false &&
			lobby.players.length < lobby.maxPlayers
		) {
			lobby.addPlayer(playerName, socket.id);
			this.socketRoomMap.set(socket.id, lobby.id);
			socket.join(lobby.id);
			server.to(lobby.id).emit(SocketEvent.UpdateLobby, lobby.getInfo());
		} else {
			throw new BadRequestException('Unable to join lobby');
		}
	}

	public leave(socket: Socket) {
		const lobbyId = this.socketRoomMap.get(socket.id);
		if (lobbyId) {
			this.socketRoomMap.delete(socket.id);
			const lobby = this.lobbys.get(lobbyId);
			if (lobby) {
				lobby.deletePlayer(socket.id);
				socket.leave(lobby.id);
				if (lobby.players.length === 0) {
					this.lobbys.delete(lobby.id);
				} else {
					lobby.players[0].isLeader = true;
					socket
						.to(lobby.id)
						.emit(SocketEvent.UpdateLobby, lobby.getInfo());
				}
			}
		}
	}

	public getLobby(socketId: string): Lobby | undefined {
		const lobbyId = this.socketRoomMap.get(socketId);
		return this.lobbys.get(lobbyId);
	}

	public getLobbies(): ILobby[] {
		const lobbys: ILobby[] = [];
		for (const lobby of this.lobbys.values()) {
			lobbys.push(lobby.getInfo());
		}
		return lobbys;
	}
}
