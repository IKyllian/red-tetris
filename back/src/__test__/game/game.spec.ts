import { Board } from '../../game/board';
import { Game } from '../../game/game';
import { Piece } from '../../game/piece';
import { Player } from '../../game/player';
import { defaultBoardSize } from '../../type/board.interface';
import { CellType } from '../../type/cell.interface';
import { Commands } from '../../type/command.types';
import { IInputsPacket } from '../../type/event.enum';
import { GameMode } from '../../type/game.type';
import { Scoring } from '../../type/scoring.enum';
import { TetriminosArray } from '../../type/tetromino.interface';

jest.mock('../../game/board');
jest.mock('seedrandom', () => {
	return () => () => 0.9;
});

describe('Game', () => {
	const player = new Player('test', 'id', true);
	const seed = 'seed';
	let board: jest.Mocked<Board>;
	let piece: jest.Mocked<Piece>;
	let game: Game;
	beforeEach(() => {
		game = new Game(player, seed, GameMode.SOLO);
		piece = new Piece(TetriminosArray[0]) as jest.Mocked<Piece>;
		board = new Board(defaultBoardSize) as jest.Mocked<Board>;
		game['piece'] = piece;
		game['board'] = board;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should initialize correctly', () => {
		expect(game.player).toBe(player);
		expect(game.piece).toBe(piece);
		expect(game.board).toBe(board);
		expect(game.gameOver).toBe(false);
		expect(game.level).toBe(0);
		expect(game.score).toBe(0);
		expect(game.totalLinesCleared).toBe(0);
		expect(game['tickToMoveDown']).toBe(0);
	});

	it('should return next piece', () => {
		const piecee = game['getNextPiece']();

		expect(piecee.type).toBe(CellType.Z);
	});

	describe('update state', () => {
		it('should update state', () => {
			game.updateState(0);
			expect(game.boardChanged).toBe(false);
			expect(game['tickToMoveDown']).toBe(1);
		});

		it('should update state with game over if player has quit', () => {
			game['hasQuit'] = true;
			game.updateState(1);
			expect(game.gameOver).toBe(true);
			expect(game.boardChanged).toBe(true);
		});

		it('should call addIndestructibleLines', () => {
			game['indestructibleQueue'] = [{ tick: 3, nb: 2 }];
			jest.spyOn(game, 'addIndestructibleLines');
			game.updateState(3);
			expect(game.addIndestructibleLines).toHaveBeenCalledWith(2);
		});
	});

	it('should push inputs into queue', () => {
		const inputsPacket: IInputsPacket = {
			tick: 1,
			inputs: [Commands.MOVE_LEFT],
			adjustmentIteration: 0,
		};
		game.pushInputsInQueue(inputsPacket);

		expect(game['inputsQueue']).toContain(inputsPacket);
	});

	describe('process inputs', () => {
		it('should skip inputs if tick is greater than current tick', () => {
			const inputsPacket: IInputsPacket = {
				tick: 2,
				inputs: [Commands.MOVE_LEFT],
				adjustmentIteration: 0,
			};
			game.pushInputsInQueue(inputsPacket);
			game.processInputs(1);

			expect(game['inputsQueue']).toContain(inputsPacket);
		});

		it('should skip inputs if tick is greater than current tick and make tick adjustement if packet is early by +15 tick', () => {
			const inputsPacket: IInputsPacket = {
				tick: 30,
				inputs: [Commands.MOVE_LEFT],
				adjustmentIteration: 0,
			};
			game.pushInputsInQueue(inputsPacket);
			game.processInputs(1);

			expect(game['inputsQueue']).toContain(inputsPacket);
			expect(game.adjustmentIteration).toBe(1);
			expect(game.tickAdjustment).toBe(-1);
		});

		it('should process inputs and execute commands', () => {
			const inputsPacket: IInputsPacket = {
				tick: 1,
				inputs: [Commands.MOVE_LEFT, Commands.MOVE_DOWN],
				adjustmentIteration: 0,
			};
			jest.spyOn(game, 'handleInputs');
			game.pushInputsInQueue(inputsPacket);
			game.processInputs(1);

			expect(game.handleInputs).toHaveBeenCalledWith(inputsPacket.inputs);
			expect(game['inputsQueue']).not.toContain(inputsPacket);
		});

		it('should discard late inputs and make tick adjustement', () => {
			const inputsPacket: IInputsPacket = {
				tick: 1,
				inputs: [Commands.MOVE_LEFT],
				adjustmentIteration: 0,
			};
			game.pushInputsInQueue(inputsPacket);
			game.processInputs(2);

			expect(game.adjustmentIteration).toBe(1);
			expect(game.tickAdjustment).toBe(16);
			expect(game['inputsQueue']).not.toContain(inputsPacket);
		});
	});

	describe('handle inputs', () => {
		it('should rotate piece', () => {
			jest.spyOn(game, 'rotate');
			game.handleInputs([Commands.ROTATE]);
			expect(game.rotate).toHaveBeenCalled();
		});

		it('should move piece left', () => {
			jest.spyOn(game, 'moveSideway');
			game.handleInputs([Commands.MOVE_LEFT]);
			expect(game.moveSideway).toHaveBeenCalled();
		});

		it('should move piece right', () => {
			jest.spyOn(game, 'moveSideway');
			game.handleInputs([Commands.MOVE_RIGHT]);
			expect(game.moveSideway).toHaveBeenCalled();
		});

		it('should move piece down', () => {
			jest.spyOn(game, 'moveDown');
			game.handleInputs([Commands.MOVE_DOWN]);
			expect(game.moveDown).toHaveBeenCalled();
		});
	});

	describe('handle line cleared', () => {
		it('should handle lines cleared in BattleRoyal mode', () => {
			game['gameMode'] = GameMode.BATTLEROYAL;
			board.checkForLines.mockReturnValueOnce(3);

			game['handleLineCleared']();

			expect(game.indestructibleToGive).toBe(2);
		});

		it('should handle lines cleared and update score and level', () => {
			board.checkForLines.mockReturnValueOnce(2);
			game['linesCleared'] = Scoring.NbOfLinesForNextLevel - 1;

			game['handleLineCleared']();

			expect(game['linesCleared']).toBe(0);
			expect(game.level).toBe(1);
			expect(game.score).toBe(Scoring.TwoLines * (game.level + 1));
			expect(game.totalLinesCleared).toBe(2);
		});
	});

	describe('handle piece down', () => {
		it('should handle piece down', () => {
			board.checkCollision.mockReturnValueOnce(false);

			game['handlePieceDown'](piece.getShape());

			expect(game.nbOfpieceDown).toBe(1);
			expect(game['piece']).not.toBe(piece);
		});

		it('should handle piece down and game over', () => {
			board.checkCollision.mockReturnValueOnce(true);

			game['handlePieceDown'](piece.getShape());

			expect(game.gameOver).toBe(true);
		});
	});

	it('should move piece down', () => {
		board.checkCollision.mockReturnValueOnce(false);
		const oldPosY = piece.position.y;

		game.moveDown();

		expect(piece.position.y).toBe(oldPosY + 1);
		expect(game.score).toBe(1);
	});

	it('should not move piece down if collision', () => {
		board.checkCollision.mockReturnValueOnce(true);
		const oldPosY = piece.position.y;
		game.moveDown();
		expect(piece.position.y).toBe(oldPosY);
	});

	it('should handle hard drop', () => {
		const oldPosY = piece.position.y;
		board.checkCollision
			.mockReturnValueOnce(false)
			.mockReturnValueOnce(false)
			.mockReturnValueOnce(true);

		game.hardDrop();

		expect(piece.position.y).toBe(oldPosY + 2);
	});

	it('should rotate piece', () => {
		game.rotate();
		expect(game.positionChanged).toBe(true);
	});

	it('should move piece sideways', () => {
		game.moveSideway({ x: 1, y: 0 });
		expect(game.positionChanged).toBe(true);
	});

	it('should check if piece can be pushed back', () => {
		const shape = piece.getShape();
		const result = game['canBePushedBack'](1, shape);
		expect(result).toBe(true);
	});

	it('should add indestructible lines', () => {
		game.addIndestructibleLines(2);
		expect(board.addIndestructibleLine).toHaveBeenCalledTimes(2);
	});

	it('should game over if piece cannot be pushed back', () => {
		game['canBePushedBack'] = jest.fn().mockReturnValueOnce(false);
		board.checkCollision.mockReturnValueOnce(true);
		game.addIndestructibleLines(1);
		expect(game.gameOver).toBe(true);
	});

	it('should get data to send', () => {
		const data = game.getDataToSend();

		expect(data).toHaveProperty('player');
		expect(data).toHaveProperty('piece');
		expect(data).toHaveProperty('board');
		expect(data).toHaveProperty('gameOver');
		expect(data).toHaveProperty('score');
		expect(data).toHaveProperty('level');
		expect(data).toHaveProperty('linesCleared');
		expect(data).toHaveProperty('currentPieceIndex');
		expect(data).toHaveProperty('tickToMoveDown');
	});
});
