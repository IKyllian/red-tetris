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
	public destrucibleLinesToGive: number = 0;

	private linesCleared: number = 0;
	private board: Board;
	private currentPiece: Piece;
	private lineScores = [
		Scoring.OneLine,
		Scoring.TwoLines,
		Scoring.ThreeLines,
		Scoring.FourLines,
	];

	constructor(player: Player, pieces: Piece[]) {
		for (let i = 0; i < 4; ++i) {
			this.pieces.push(cloneDeep(pieces[i]));
		}
		this.currentPiece = this.pieces[0];
		this.board = new Board(defaultBoardSize);
		this.board.transferPieceToBoard({
			tetromino: this.currentPiece,
			isOccupied: false,
		});
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
			this.clearInterval();
			return;
		}
		if (this.downInterval === null && !this.gameOver) {
			this.downInterval = setInterval(() => {
				this.moveDown(true);
			}, 1000);
		}
	}

	public clearInterval() {
		if (this.downInterval !== null) {
			clearInterval(this.downInterval);
			this.downInterval = null;
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
				this.clearInterval();
				this.moveDown();
				break;
			default:
				this.clearInterval();
				this.hardDrop();
				break;
		}
	}

	public moveDown(fromInterval: boolean = false) {
		if (!fromInterval) {
			this.score += 1;
		}
		const newPosition = {
			...this.currentPiece.position,
			y: this.currentPiece.position.y + 1,
		};
		if (this.board.checkCollision(newPosition, this.currentPiece)) {
			this.board.transferPieceToBoard({
				tetromino: this.currentPiece,
				isOccupied: true,
			});
			this.newPieceNeeded = true;
			this.currentPiece = this.pieces[1];
			this.nbOfpieceDown++;
			const linesCleared = this.board.checkForLines();
			if (linesCleared > 0) {
				this.destrucibleLinesToGive = linesCleared - 1;
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
			this.board.transferPieceToBoard({
				tetromino: this.currentPiece,
				isOccupied: false,
			});
		} else {
			this.board.clearOldPosition(this.currentPiece);
			this.currentPiece.position = newPosition;
			this.board.transferPieceToBoard({
				tetromino: this.currentPiece,
				isOccupied: false,
			});
		}
	}

	public hardDrop() {
		while (!this.newPieceNeeded) {
			this.score += 1;
			this.moveDown();
		}
	}

	public rotate() {
		const oldShape = this.currentPiece.shape;
		this.board.clearOldPosition(this.currentPiece);
		this.currentPiece.rotatePiece();
		if (
			this.board.checkCollision(
				this.currentPiece.position,
				this.currentPiece
			)
		) {
			this.currentPiece.shape = oldShape;
			this.board.transferPieceToBoard({
				tetromino: this.currentPiece,
				isOccupied: false,
			});
		} else {
			this.board.transferPieceToBoard({
				tetromino: this.currentPiece,
				isOccupied: false,
			});
		}
	}

	public moveLeft() {
		const newPosition = {
			...this.currentPiece.position,
			x: this.currentPiece.position.x - 1,
		};
		if (this.board.checkCollision(newPosition, this.currentPiece)) {
			this.board.transferPieceToBoard({
				tetromino: this.currentPiece,
				isOccupied: false,
			});
		} else {
			this.board.clearOldPosition(this.currentPiece);
			this.currentPiece.position = newPosition;
			this.board.transferPieceToBoard({
				tetromino: this.currentPiece,
				isOccupied: false,
			});
		}
	}

	public moveRight() {
		const newPosition = {
			...this.currentPiece.position,
			x: this.currentPiece.position.x + 1,
		};
		if (this.board.checkCollision(newPosition, this.currentPiece)) {
			this.board.transferPieceToBoard({
				tetromino: this.currentPiece,
				isOccupied: false,
			});
		} else {
			this.board.clearOldPosition(this.currentPiece);
			this.currentPiece.position = newPosition;
			this.board.transferPieceToBoard({
				tetromino: this.currentPiece,
				isOccupied: false,
			});
		}
	}

	public addDestructibleLines(nbOfLines: number) {
		this.board.addIndestructibleLines(nbOfLines);
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
