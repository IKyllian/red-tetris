
import { Player } from "./player";
import { SoloGame } from "./solo-game";
import { Server } from 'socket.io';
import { LeaderboardService } from "../leaderboard/leaderboard.service";
import { GameMode } from '../type/game.type';
import { SocketEvent } from '../type/event.enum';
import {
	IGameUpdatePacketHeader,
	UpdateType,
} from '../type/packet.type';

describe('solo-games', () => {
    const mockPlayer = {
        id: 'test',
        name: 'test',
    };
      
    const mockServer = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
    };
      
    const mockLeaderboardService = {
        create: jest.fn(),
    };
    let soloGame: SoloGame;
    let player: Player;
    let server: Server;
    let leaderboardService: LeaderboardService;
  
    beforeEach(() => {
      player = mockPlayer as any;
      server = mockServer as any;
      leaderboardService = mockLeaderboardService as any;
  
      soloGame = new SoloGame(player, server, leaderboardService);
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });


    describe('leave', () => {
        it('should leave the game', () => {
            soloGame.leave()
            expect(soloGame.game.hasQuit).toBe(true)
        })  
    })

    describe('start', () => {
        it('should emit StartingGame event with correct data', () => {
            const updateSpy = jest.spyOn(soloGame as any, 'update').mockImplementation(() => {});
            soloGame.start();
        
            expect(server.to).toHaveBeenCalledWith(player.id);
            expect(server.emit).toHaveBeenCalledWith(SocketEvent.StartingGame, {
                playerGame: soloGame.game.getDataToSend(),
                gameMode: GameMode.SOLO,
                seed: expect.any(String),
            });
            expect(updateSpy).toHaveBeenCalled();
        });
    });

    describe('getPlayerGame', () => {
        it('should return player game', () => {
            expect(soloGame.getPlayerGame('test')).toEqual(soloGame.game);   
        })
    })

    describe('checkGameOver', () => {
        it('should be true if player leave the game', () => {
            soloGame.leave()
            expect(soloGame['checkGameOver']()).toBe(true)
        })

        it('should be true if game is over with game score > 0', () => {
            soloGame.game.gameOver = true;
            soloGame.game.score = 20000;
            expect(soloGame['checkGameOver']()).toBe(true)
            expect(server.emit).toHaveBeenCalledWith(SocketEvent.GameOver, soloGame['ranking'])
            expect(mockLeaderboardService.create).toHaveBeenCalledWith(soloGame.game.player.name, soloGame.game.score)
        })

        it('should be true if game is over with game score not > 0', () => {
            soloGame.game.gameOver = true;
            expect(soloGame['checkGameOver']()).toBe(true)
            expect(server.emit).toHaveBeenCalledWith(SocketEvent.GameOver, soloGame['ranking'])
        })

        it('should be false if game not over', () => {
            expect(soloGame['checkGameOver']()).toBe(false)
        })
    })

    describe('sendUpdates', () => {
        it('Should not emit', () => {
            soloGame['sendUpdates']()
            expect(server.emit).not.toHaveBeenCalled()    
        })

        it('Should emit game update because positionChanged', () => {
            soloGame.game.positionChanged = true
            soloGame['sendUpdates']()
            const gamePacket = {
				updateType: UpdateType.GAME,
				state: soloGame.game.getDataToSend(),
			}
            const dataToSend: IGameUpdatePacketHeader = {
				tick: soloGame.tick,
				tickAdjustment: soloGame.game.tickAdjustment,
				adjustmentIteration: soloGame.game.adjustmentIteration,
				gamePackets: [gamePacket]
			};
            expect(server.emit).toHaveBeenCalledWith(SocketEvent.GamesUpdate, dataToSend)
        })

        it('Should emit game update because boardChanged', () => {
            soloGame.game.boardChanged = true
            soloGame['sendUpdates']()
            const gamePacket = {
				updateType: UpdateType.GAME,
				state: soloGame.game.getDataToSend(),
			}
            const dataToSend: IGameUpdatePacketHeader = {
				tick: soloGame.tick,
				tickAdjustment: soloGame.game.tickAdjustment,
				adjustmentIteration: soloGame.game.adjustmentIteration,
				gamePackets: [gamePacket]
			};
            expect(server.emit).toHaveBeenCalledWith(SocketEvent.GamesUpdate, dataToSend)
        })
    })

    describe('createRandomSeed', () => {
        it('should create a random seed of the specified length', () => {
          const length = 10;
          const seed = soloGame['createRandomSeed'](length);
    
          expect(typeof seed).toBe('string');
          expect(seed).toHaveLength(length);
          const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
          for (const char of seed) {
            expect(allowedChars).toContain(char);
          }
        });
    
        it('should create a random seed of the default length when no length is provided', () => {
          const defaultLength = 20;
          const seed = soloGame['createRandomSeed']();
    
          expect(typeof seed).toBe('string');
          expect(seed).toHaveLength(defaultLength);
          const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
          for (const char of seed) {
            expect(allowedChars).toContain(char);
          }
        });
    });
})