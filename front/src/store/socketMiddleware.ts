import { Middleware } from "@reduxjs/toolkit";
import SocketFactory, { SocketInterface } from "./socketFactory";
import { commandPressed, connectionEstablished, connectionLost, initSocket } from "./socket.slice";
import { setBoard, setBoardListener } from "./board.slice";
import { ICell } from "../types/board.types";
import { createLobby, joinLobby, leaveLobby, setLobby } from "./lobby.slice";
import { ILobby } from "../types/lobby.type";

enum SocketEvent {
    Connect = "connect",
    Disconnect = "disconnect",
    // Emit events
    CreateLobby = "create-lobby",
    JoinLobby = "join-lobby",
    LeaveLobby= "leave-lobby",
    UpdateLobby = "update-lobby",
    BoardUpdate = "board-update",
    CommandPressed = "command-pressed",
    // On events
    Error = "error",
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

                socket.socket.on(SocketEvent.JoinLobby, (lobby: ILobby) => {
                    store.dispatch(setLobby(lobby));
                })
            }
        }

        if (createLobby.match(action) && socket) {
            socket.socket.emit(SocketEvent.CreateLobby, action.payload);
        }

        if (joinLobby.match(action) && socket) {
            socket.socket.emit(SocketEvent.JoinLobby, action.payload);
        }

        if (leaveLobby.match(action) && socket) {
            socket.socket.emit(SocketEvent.LeaveLobby, action.payload);
        }
        
        // Listen for board updates
        if (setBoardListener.match(action) && socket) {
            socket.socket.on(SocketEvent.BoardUpdate, (cells: ICell[][]) => {
                store.dispatch(setBoard({ cells }));
            })
        }

        // Handle the commands action
        if (commandPressed.match(action) && socket) {
            let command = action.payload;
            console.log("command: " + command);
            // Send command
            // socket.socket.emit(SocketEvent.CommandPressed, command);
        }
        next(action);
    };
};

export default socketMiddleware;