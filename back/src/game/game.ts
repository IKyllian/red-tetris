import { defaultBoardSize } from 'src/type/board.interface';
import { Board } from './board';
import { Player } from './player';
import { cloneDeep } from 'lodash';
import { Piece } from './piece';
import { COMMANDS } from 'src/type/command.types';
import { Scoring } from 'src/type/scoring.enum';
import { IInputsPacket } from 'src/type/event.enum';

export interface IGame {
	player: Player;
	pieces: Piece[];
	board: Board;
	gameOver: boolean;
	score: number;
	level: number;
}

export class Game {
	public player: Player;
	public pieces: Piece[] = [];
	public nbOfpieceDown: number = 0;
	public newPieceNeeded: boolean = false;
	public gameOver: boolean = false;
	public downInterval: NodeJS.Timeout | null = null;
	public level: number = 0;
	public score: number = 0;
	public totalLinesCleared: number = 0;
	public destructibleLinesToGive: number = 0;
	public lastPacketSendAt: number = 0;

	private tick = 0;
	private inputsQueue: IInputsPacket[] = [];
	private linesCleared: number = 0;
	private board: Board;
	private currentPiece: Piece;
	private tickToMoveDown: number = 0;
	private lineScores = [
		Scoring.OneLine,
		Scoring.TwoLines,
		Scoring.ThreeLines,
		Scoring.FourLines,
	];

	constructor(player: Player, pieces: Piece[], level: number) {
		this.level = level;
		for (let i = 0; i < 4; ++i) {
			this.pieces.push(cloneDeep(pieces[i]));
		}
		this.currentPiece = this.pieces[0];
		this.board = new Board(defaultBoardSize);
		this.board.transferPieceToBoard(this.currentPiece, false);
		this.player = player;
	}

	public addPiece(piece: Piece) {
		this.pieces = this.pieces.slice(1);
		this.pieces.push(cloneDeep(piece));
		this.newPieceNeeded = false;
	}

	public updateState(tick: number, ranking: Player[]) {
		this.tick = tick;
		// console.log('Score = ', this.score, ' - Level = ', this.level);
		if (this.board.gameOver) {
			ranking.push(this.player);
			this.gameOver = true;
			return;
		}
		this.processInputs(tick);
		if (this.tickToMoveDown >= this.getFramesPerGridCell(this.level)) {
			this.moveDown(true);
		} else {
			this.tickToMoveDown++;
		}
	}

	public pushInputsInQueue(inputs: IInputsPacket) {
		this.inputsQueue.push(inputs);
	}

	// TODO client server sync, server reconciliation
	public processInputs(tick: number) {
		if (this.inputsQueue.length === 1) {
			console.log('server tick = ', tick);
			console.log(
				'inputsQueue tick = ',
				this.inputsQueue[0].tick,
				' - inputs = ',
				this.inputsQueue[0].inputs
			);
		}
		while (
			this.inputsQueue.length > 0 &&
			tick === this.inputsQueue[0].tick
		) {
			this.handleInputs(this.inputsQueue[0].inputs);
			this.inputsQueue.shift();
		}
	}

	public handleInputs(commands: COMMANDS[]) {
		for (const command of commands) {
			if (this.gameOver) return;
			console.log('command = ', command);
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
			...this.currentPiece.position,
			y: this.currentPiece.position.y + 1,
		};
		if (this.board.checkCollision(newPosition, this.currentPiece.shape)) {
			this.board.transferPieceToBoard(this.currentPiece, true);
			this.newPieceNeeded = true;
			this.currentPiece = this.pieces[1];
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
			this.board.transferPieceToBoard(this.currentPiece, false);
		} else {
			this.board.clearOldPosition(this.currentPiece);
			this.currentPiece.position = newPosition;
			this.board.transferPieceToBoard(this.currentPiece, false);
		}
	}

	public hardDrop() {
		while (!this.newPieceNeeded) {
			this.score += 1;
			this.moveDown();
		}
	}

	public rotate() {
		this.currentPiece.rotate(this.board);
	}

	public moveLeft() {
		const newPosition = {
			...this.currentPiece.position,
			x: this.currentPiece.position.x - 1,
		};
		if (!this.board.checkCollision(newPosition, this.currentPiece.shape)) {
			this.board.clearOldPosition(this.currentPiece);
			this.currentPiece.position = newPosition;
			this.board.transferPieceToBoard(this.currentPiece, false);
		}
	}

	public moveRight() {
		const newPosition = {
			...this.currentPiece.position,
			x: this.currentPiece.position.x + 1,
		};
		if (!this.board.checkCollision(newPosition, this.currentPiece.shape)) {
			this.board.clearOldPosition(this.currentPiece);
			this.currentPiece.position = newPosition;
			this.board.transferPieceToBoard(this.currentPiece, false);
		}
	}

	public addDestructibleLines(nbOfLines: number) {
		this.board.addIndestructibleLines(nbOfLines);
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
			pieces: this.pieces,
			board: this.board,
			gameOver: this.gameOver,
			score: this.score,
			level: this.level,
		};
	}
}
