import { IBoard, defaultBoardSize } from 'src/type/board.interface';
import { Board } from './board';
import { Player } from './player';
import { defaultCell } from 'src/type/cell.interface';
import { cloneDeep, set } from 'lodash';
import { IPosition, defaultPosition } from 'src/type/tetromino.interface';
import { Piece } from './piece';
import { COMMANDS } from 'src/type/command.types';
import { Scoring } from 'src/type/scoring.enum';

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

	public updateState() {
		// console.log('Score = ', this.score, ' - Level = ', this.level);
		if (this.board.gameOver) {
			this.gameOver = true;
			return;
		}
		if (this.tickToMoveDown >= this.getFramesPerGridCell(this.level) / 2) {
			this.moveDown(true);
		} else {
			this.tickToMoveDown++;
		}
	}

	public handleCommand(command: COMMANDS) {
		if (this.gameOver) return;

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
		const newShape = this.currentPiece.getRotatedShape();
		if (!this.board.checkCollision(this.currentPiece.position, newShape)) {
			this.board.clearOldPosition(this.currentPiece);
			this.currentPiece.shape = newShape;
			this.board.transferPieceToBoard(this.currentPiece, false);
		}
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
		if (level <= 9) {
			return 48 - level * 5;
		} else if (level <= 12) {
			return 5;
		} else if (level <= 15) {
			return 4;
		} else if (level <= 18) {
			return 3;
		} else if (level <= 28) {
			return 2;
		} else {
			return 1;
		}
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
