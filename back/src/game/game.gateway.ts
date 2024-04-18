import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Game } from './game';

@WebSocketGateway()
export class GameGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('play')
  handlePlay(client: any, payload: any) {
    console.log('play', payload);
    new Game();
  }
}
