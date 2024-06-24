import { io, Socket } from 'socket.io-client';

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
