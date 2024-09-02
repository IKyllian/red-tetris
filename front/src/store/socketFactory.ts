import { io, Socket } from 'socket.io-client';

let socketConnection: Socket | undefined;

// The SocketFactory is responsible for creating and returning a single instance of the SocketConnection class
// Implementing the singleton pattern
class SocketFactory {
	public static Instance() {
		if (!socketConnection) {
			console.info('process.env.VITE_IP = ', import.meta.env.VITE_IP)
			socketConnection = io(`${import.meta.env.VITE_IP}:3000`);
		}
		return socketConnection;
	}
}

export default SocketFactory;
