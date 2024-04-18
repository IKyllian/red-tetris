import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Game } from './game';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway implements OnGatewayConnection{
  @WebSocketServer() server: Server;

  async handleConnection(socket: Socket) {
    console.log("TEST = ", socket.id);
  }

  @SubscribeMessage('play')
  handlePlay(client: any, payload: any) {
    console.log('play', payload);
    new Game();
  }
}
