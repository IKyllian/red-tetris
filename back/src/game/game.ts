import { defaultBoardSize } from 'src/type/board.interface';
import { Board } from './board';
import { Player } from './player';
import { cloneDeep } from 'lodash';
import { Piece } from './piece';
import { COMMANDS } from 'src/type/command.types';
import { Scoring } from 'src/type/scoring.enum';
import { IInputsPacket } from 'src/type/event.enum';
import seedrandom from 'seedrandom';
import { TetriminosArray } from 'src/type/tetromino.interface';

export interface IGame {
	player: Player;
	piece: Piece;
	board: Board;
	gameOver: boolean;
	score: number;
	level: number;
	currentPieceIndex: number;
	tickToMoveDown: number;
}

export class Game {
	public player: Player;
	public piece: Piece;
	public nbOfpieceDown: number = 0;
	public newPieceNeeded: boolean = false;
	public gameOver: boolean = false;
	public downInterval: NodeJS.Timeout | null = null;
	public level: number = 0;
	public score: number = 0;
	public totalLinesCleared: number = 0;
	public destructibleLinesToGive: number = 0;
	public lastPacketSendAt: number = 0;
	public positionChanged: boolean = false;
	public boardChanged: boolean = false;
	public tickAdjustment = 0;
	public adjustmentIteration = 0;

	private inputsQueue: IInputsPacket[] = [];
	private linesCleared: number = 0;
	public board: Board; //todo private
	// private currentPiece: Piece;
	private tickToMoveDown: number = 0;
	private rng: seedrandom.PRNG;
	private lineScores = [
		Scoring.OneLine,
		Scoring.TwoLines,
		Scoring.ThreeLines,
		Scoring.FourLines,
	];

	constructor(player: Player, level: number, seed: string) {
		this.level = level;
		this.rng = seedrandom(seed);
		// for (let i = 0; i < 4; i++) {
		// 	this.pieces.push(this.getNextPiece());
		// }
		// this.currentPiece = this.pieces[0];
		this.piece = this.getNextPiece();
		this.board = new Board(defaultBoardSize);
		this.player = player;
		const shape = this.piece.getShape();
		// this.board.transferPieceToBoard(this.piece, shape, false);
	}

	// public addPiece(piece: Piece) {
	// 	this.pieces = this.pieces.slice(1);
	// 	this.pieces.push(cloneDeep(piece));
	// 	this.newPieceNeeded = false;
	// }

	private getNextPiece() {
		const index = Math.floor(this.rng() * TetriminosArray.length);
		const piece = new Piece(TetriminosArray[index]);
		return piece;
	}

	// private shiftPieces() {
	// 	this.pieces.shift();
	// 	const piece = this.getNextPiece();
	// 	this.pieces.push(piece);
	// 	this.currentPiece = this.getNextPiece();;
	// }

	public updateState(tick: number) {
		//TODO find better way?
		if (this.gameOver) {
			return;
		}

		this.processInputs(tick);
		if (this.tickToMoveDown >= this.getFramesPerGridCell(this.level)) {
			this.moveDown(true);
			this.positionChanged = true;
		} else {
			this.tickToMoveDown++;
		}
		if (this.gameOver) {
			// this.gameOver = true;
			//TODO game over update type
			this.boardChanged = true;
		}
	}

	public pushInputsInQueue(inputs: IInputsPacket) {
		this.inputsQueue.push(inputs);
	}

	// TODO client server sync, server reconciliation
	public processInputs(tick: number) {
		if (this.inputsQueue.length === 1) {
		}
		while (this.inputsQueue.length > 0) {
			// console.log(
			// 	'inputsQueue: ',
			// 	this.inputsQueue[0].inputs,
			// 	' - tick: ',
			// 	tick,
			// 	' - client tick: ',
			// 	this.inputsQueue[0].tick
			// );
			const packet = this.inputsQueue[0];

			// this.handleInputs(packet.inputs);
			// this.inputsQueue.shift();

			if (packet.tick > tick) {
				break;
			} else if (packet.tick === tick) {
				this.handleInputs(packet.inputs);
				// console.log(
				// 	'inputs processed: ',
				// 	packet.inputs,
				// 	' - tick: ',
				// 	tick,
				// 	' - client tick: ',
				// 	packet.tick
				// );
				this.inputsQueue.shift();
			} else if (tick > packet.tick) {
				if (this.adjustmentIteration === packet.adjustmentIteration) {
					this.adjustmentIteration++;
					this.tickAdjustment = tick - packet.tick + 5;
					console.log('adjustment: ', this.tickAdjustment);
				}
				this.inputsQueue.shift();
			}
		}
	}

	public handleInputs(commands: COMMANDS[]) {
		for (const command of commands) {
			//TODO check if old position is not the same as new position to not emit useless data
			if (this.gameOver) return;
			this.positionChanged = true;
			switch (command) {
				case COMMANDS.KEY_UP:
					this.rotate();
					break;
				case COMMANDS.KEY_LEFT:
					this.moveLeft();
					break;
				case COMMANDS.KEY_RIGHT:
					this.moveRight();
					break;
				case COMMANDS.KEY_DOWN:
					this.moveDown();
					break;
				default:
					this.hardDrop();
					break;
			}
		}
	}

	public moveDown(fromInterval: boolean = false) {
		if (!fromInterval) {
			this.score += 1;
		}
		this.tickToMoveDown = 0;
		const newPosition = {
			...this.piece.position,
			y: this.piece.position.y + 1,
		};
		const shape = this.piece.getShape();
		if (this.board.checkCollision(newPosition, shape)) {
			this.board.transferPieceToBoard(this.piece, shape, true);
			// this.shiftPieces();
			// this.board.printBoard();
			this.piece = this.getNextPiece();
			this.boardChanged = true;
			this.nbOfpieceDown++;
			const linesCleared = this.board.checkForLines();
			if (linesCleared > 0) {
				this.destructibleLinesToGive = linesCleared - 1;
				this.linesCleared += linesCleared;
				if (this.linesCleared >= Scoring.NbOfLinesForNextLevel) {
					this.linesCleared -= Scoring.NbOfLinesForNextLevel; //TODO Not sure
					this.level++;
					this.linesCleared = 0;
				}
				let lineScore = 0;
				if (linesCleared <= this.lineScores.length) {
					lineScore =
						this.lineScores[linesCleared - 1] * (this.level + 1);
				}
				this.score += lineScore;
				this.totalLinesCleared += linesCleared;
			}
			// add new piece to the board
			const newShape = this.piece.getShape();
			//TODO check colision here and get rid of gameover in board?
			if (this.board.checkCollision(this.piece.position, newShape)) {
				this.gameOver = true;
			}
			// this.board.transferPieceToBoard(this.piece, newShape, false);
		} else {
			// this.board.clearOldPosition(this.piece, shape);
			this.piece.position = newPosition;
			// this.board.transferPieceToBoard(this.piece, shape, false);
		}
	}

	public hardDrop() {
		//TODO get drop position and add score
		const nb = this.nbOfpieceDown;
		while (this.nbOfpieceDown === nb) {
			this.score += 1;
			this.moveDown();
		}
	}

	public rotate() {
		this.piece.rotate(this.board);
	}

	public moveLeft() {
		const newPosition = {
			...this.piece.position,
			x: this.piece.position.x - 1,
		};
		const shape = this.piece.getShape();
		if (!this.board.checkCollision(newPosition, shape)) {
			// this.board.clearOldPosition(this.piece, shape);
			this.piece.position = newPosition;
			// this.board.transferPieceToBoard(this.piece, shape, false);
		}
	}

	public moveRight() {
		const newPosition = {
			...this.piece.position,
			x: this.piece.position.x + 1,
		};
		const shape = this.piece.getShape();
		if (!this.board.checkCollision(newPosition, shape)) {
			// this.board.clearOldPosition(this.piece, shape);
			this.piece.position = newPosition;
			// this.board.transferPieceToBoard(this.piece, shape, false);
		}
	}

	public addDestructibleLines(nbOfLines: number) {
		//TODO if game over returm
		console.log(
			'addDestructibleLines to ',
			this.player.name,
			'-',
			nbOfLines
		);
		this.board.addIndestructibleLines(nbOfLines);
		//TODO check if game over ?
		this.piece.position.y -= nbOfLines;

		this.boardChanged = true;
	}

	private getFramesPerGridCell(level: number): number {
		let framesPerGridCell = 0;
		if (level <= 9) {
			framesPerGridCell = 48 - level * 5;
		} else if (level <= 12) {
			framesPerGridCell = 5;
		} else if (level <= 15) {
			framesPerGridCell = 4;
		} else if (level <= 18) {
			framesPerGridCell = 3;
		} else if (level <= 28) {
			framesPerGridCell = 2;
		} else {
			framesPerGridCell = 1;
		}
		// framesPerGridCell / 2 because of tick rate
		return framesPerGridCell / 2;
	}

	public getDataToSend(): IGame {
		return {
			player: this.player,
			piece: this.piece,
			board: this.board,
			gameOver: this.gameOver,
			score: this.score,
			level: this.level,
			currentPieceIndex: this.nbOfpieceDown,
			tickToMoveDown: this.tickToMoveDown,
		};
	}
}
