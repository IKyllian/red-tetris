import { io, Socket } from 'socket.io-client';

let socketConnection: Socket | undefined;

const socketInstance = () => {
	if (!socketConnection) {
		socketConnection = io(`${process.env.VITE_IP_URL}:3000`);
	}
	return socketConnection;
}
export default socketInstance
