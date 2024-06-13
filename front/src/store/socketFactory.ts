import { io, Socket } from 'socket.io-client';

export interface SocketInterface {
	socket: Socket;
}

// class SocketConnection implements SocketInterface {
// 	public socket: Socket;
// 	public socketEndpoint = 'http://localhost:3000';
// 	// The constructor will initialize the Socket Connection
// 	constructor() {
// 		this.socket = io(this.socketEndpoint);
// 	}
// }

let socketConnection: Socket | undefined;

// The SocketFactory is responsible for creating and returning a single instance of the SocketConnection class
// Implementing the singleton pattern
class SocketFactory {
	public static Instance() {
		if (!socketConnection) {
			socketConnection = io('http://localhost:3000');
		}
		return socketConnection;
	}
}

export default SocketFactory;
