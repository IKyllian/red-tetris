import { defaultBoardSize } from 'src/type/board.interface';
import { Board } from './board';
import { Player } from './player';
import { Piece } from './piece';
import { Scoring } from 'src/type/scoring.enum';
import seedrandom from 'seedrandom';
import { IPosition, TetriminosArray } from 'src/type/tetromino.interface';
import { GameMode } from 'src/type/game.type';
import { Commands } from 'src/type/command.types';
import { IInputsPacket } from 'src/type/event.enum';

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
	public gameOver: boolean = false;
	public level: number = 0;
	public score: number = 0;
	public totalLinesCleared: number = 0;
	public indestructibleToGive: number = 0;
	public lastPacketSendAt: number = 0;
	public positionChanged: boolean = false;
	public boardChanged: boolean = false;
	public tickAdjustment = 0;
	public adjustmentIteration = 0;
	public indestructibleQueue: { tick: number; nb: number }[] = [];
	public hasQuit: boolean = false;

	private gameMode: GameMode;
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

	constructor(player: Player, seed: string, gameMode: GameMode) {
		this.gameMode = gameMode;
		this.rng = seedrandom(seed);
		this.piece = this.getNextPiece();
		this.board = new Board(defaultBoardSize);
		this.player = player;
	}

	private getNextPiece() {
		const index = Math.floor(this.rng() * TetriminosArray.length);
		const piece = new Piece(TetriminosArray[index]);
		return piece;
	}

	private getPosDown(position: IPosition): IPosition {
		return { ...position, y: position.y + 1 };
	}

	private getPosRight(position: IPosition): IPosition {
		return { ...position, x: position.x + 1 };
	}

	private getPosLeft(position: IPosition): IPosition {
		return { ...position, x: position.x - 1 };
	}

	public updateState(tick: number, gravity?: number) {
		//TODO find better way?
		this.boardChanged = false;
		this.positionChanged = false;
		if (this.gameOver) {
			return;
		} else if (this.hasQuit) {
			this.gameOver = true;
			this.boardChanged = true;
			return;
		}
		for (let i = 0; i < this.indestructibleQueue.length; i++) {
			const indestructible = this.indestructibleQueue[i];
			if (indestructible.tick === tick) {
				console.log('add indestructible lines at tick: ', tick);
				this.addIndestructibleLines(indestructible.nb);
				this.indestructibleQueue.splice(i, 1);
				i--;
			}
		}

		this.processInputs(tick);
		switch (this.gameMode) {
			case GameMode.BATTLEROYAL:
				if (this.tickToMoveDown >= 1) {
					this.moveDown(true);
				} else {
					this.tickToMoveDown += gravity;
				}
				break;
			default:
				if (
					this.tickToMoveDown >= this.getFramesPerGridCell(this.level)
				) {
					this.moveDown(true);
				} else {
					this.tickToMoveDown++;
				}
				break;
		}

		if (this.gameOver) {
			this.boardChanged = true;
		}
	}

	public pushInputsInQueue(inputs: IInputsPacket) {
		if (!this.gameOver) {
			this.inputsQueue.push(inputs);
		}
	}

	public processInputs(tick: number) {
		while (this.inputsQueue.length > 0) {
			const packet = this.inputsQueue[0];
			if (packet.tick > tick) {
				break;
			} else if (packet.tick === tick) {
				if (this.player.isLeader) {
					console.log(
						'tick: ',
						tick,
						'input processed: ',
						packet.inputs.length
					);
				}
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

	public handleInputs(commands: Commands[]) {
		for (const command of commands) {
			//TODO check if old position is not the same as new position to not emit useless data
			if (this.gameOver) return;

			switch (command) {
				case Commands.ROTATE:
					this.rotate();
					break;
				case Commands.MOVE_LEFT:
					this.moveSideway(this.getPosLeft(this.piece.position));
					break;
				case Commands.MOVE_RIGHT:
					this.moveSideway(this.getPosRight(this.piece.position));
					break;
				case Commands.MOVE_DOWN:
					this.moveDown();
					break;
				default:
					this.hardDrop();
					break;
			}
		}
	}

	private handleLineCleared() {
		const linesCleared = this.board.checkForLines();
		if (linesCleared > 0) {
			switch (this.gameMode) {
				case GameMode.BATTLEROYAL:
					this.indestructibleToGive = linesCleared - 1;
					break;
				default:
					this.linesCleared += linesCleared;
					if (this.linesCleared >= Scoring.NbOfLinesForNextLevel) {
						this.linesCleared -= Scoring.NbOfLinesForNextLevel; //TODO Not sure
						this.level++;
						this.linesCleared = 0;
					}
					let lineScore = 0;
					if (linesCleared <= this.lineScores.length) {
						lineScore =
							this.lineScores[linesCleared - 1] *
							(this.level + 1);
					}
					this.score += lineScore;
					this.totalLinesCleared += linesCleared;
					break;
			}
		}
	}

	private handlePieceDown(shape: number[][]) {
		this.board.transferPieceToBoard(this.piece, shape, true);
		this.boardChanged = true;
		this.nbOfpieceDown++;

		this.handleLineCleared();
		// add new piece to the board
		this.piece = this.getNextPiece();
		const newShape = this.piece.getShape();
		if (this.board.checkCollision(this.piece.position, newShape)) {
			//Todo: Transfer piece to board?
			this.gameOver = true;
		}
	}

	public moveDown(fromInterval: boolean = false) {
		if (!fromInterval) {
			this.score += 1;
		}
		this.tickToMoveDown = 0;
		const newPosition = this.getPosDown(this.piece.position);
		const shape = this.piece.getShape();
		if (this.board.checkCollision(newPosition, shape)) {
			this.handlePieceDown(shape);
		} else {
			this.positionChanged = true;
			this.piece.position = newPosition;
		}
	}

	public hardDrop() {
		//TODO get drop position and add score
		this.tickToMoveDown = 0;
		let nextPos = this.getPosDown(this.piece.position);
		const shape = this.piece.getShape();
		while (!this.board.checkCollision(nextPos, shape)) {
			this.score += 2;
			this.piece.position = nextPos;
			nextPos = this.getPosDown(nextPos);
		}
		this.handlePieceDown(shape);
	}

	public rotate() {
		this.piece.rotate(this.board);
		this.positionChanged = true; //TODO check if needed
	}

	public moveSideway(newPosition: IPosition) {
		const shape = this.piece.getShape();
		if (!this.board.checkCollision(newPosition, shape)) {
			this.positionChanged = true;
			// this.board.clearOldPosition(this.piece, shape);
			this.piece.position = newPosition;
			// this.board.transferPieceToBoard(this.piece, shape, false);
		}
	}

	private canBePushedBack(pieceY: number, shape: number[][]) {
		for (let y = 0; y < shape.length; y++) {
			for (let x = 0; x < shape[y].length; x++) {
				if (shape[y][x]) {
					const _y = y + pieceY;
					if (_y < 0) {
						return false;
					}
				}
			}
		}
		return true;
	}

	public addIndestructibleLines(nbOfLines: number) {
		const shape = this.piece.getShape();
		for (let i = 0; i < nbOfLines; i++) {
			this.board.addIndestructibleLine();
			if (this.canBePushedBack(this.piece.position.y - 1, shape)) {
				this.piece.position.y--;
			} else if (this.board.checkCollision(this.piece.position, shape)) {
				this.gameOver = true;
				break;
			}
		}
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
