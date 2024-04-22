import { Middleware } from "@reduxjs/toolkit";
import SocketFactory, { SocketInterface } from "./socketFactory";
import { connectionEstablished, connectionLost, initSocket } from "./socket.slice";
import { setBoard, setBoardListener } from "./board.slice";
import { ICell, IGame } from "../types/board.types";
import { commandPressed, createLobby, joinLobby, leaveLobby, setLobby, startGame, updateGamesBoard } from "./lobby.slice";
import { ILobby } from "../types/lobby.type";

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
	StopGame = 'stop-game',
	GamesUpdate = 'games-update',
	// On events
	Error = 'error',
}

const socketMiddleware: Middleware = (store) => {
    let socket: SocketInterface;

    return (next) => (action) => {
        // Middleware logic for the `initSocket` action
        if (initSocket.match(action)) {
            if (!socket) {
                // Create Socket
                socket = SocketFactory.create();

                socket.socket.on(SocketEvent.Connect, () => {
                    store.dispatch(connectionEstablished());
                });

                // handle all Error events
                socket.socket.on(SocketEvent.Error, (message) => {
                    console.error(message);
                });

                // Handle disconnect event
                socket.socket.on(SocketEvent.Disconnect, (reason) => {
                    console.error(reason);
                    store.dispatch(connectionLost());
                });

                socket.socket.on(SocketEvent.UpdateLobby, (lobby: ILobby) => {
                    console.log("Updated Lobby = ", lobby);
                    store.dispatch(setLobby(lobby));
                })

                socket.socket.on(SocketEvent.GamesUpdate, (games: IGame[]) => {
                    store.dispatch(updateGamesBoard(games));
                })
            }
        }

        if (createLobby.match(action) && socket) {
            console.log('CreateLobby', action.payload);
            socket.socket.emit(SocketEvent.CreateLobby, {data: action.payload} );
        }

        if (joinLobby.match(action) && socket) {
            socket.socket.emit(SocketEvent.JoinLobby, {data: action.payload});
        }

        if (leaveLobby.match(action) && socket) {
            socket.socket.emit(SocketEvent.LeaveLobby, action.payload);
        }

        if (startGame.match(action) && socket) {
            socket.socket.emit(SocketEvent.StartGame, {data: action.payload} );
        }
        
        // Listen for board updates
        if (setBoardListener.match(action) && socket) {
            socket.socket.on(SocketEvent.BoardUpdate, (cells: ICell[][]) => {
                store.dispatch(setBoard({ cells }));
            })
        }

        // Handle the commands action
        if (commandPressed.match(action) && socket) {
            let command = {data: {...action.payload}};
            socket.socket.emit(SocketEvent.CommandPressed, command);
        }
        next(action);
    };
};

export default socketMiddleware;