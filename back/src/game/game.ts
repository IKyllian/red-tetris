import { IBoard, defaultBoardSize } from 'src/type/board.interface';
import { Board } from './board';
import { Player } from './player';
import { defaultCell } from 'src/type/cell.interface';
import { cloneDeep, set } from 'lodash';
import { IPosition, defaultPosition } from 'src/type/tetromino.interface';
import { Piece } from './piece';
import { COMMANDS } from 'src/type/command.types';

export interface IGame {
	player: Player;
	pieces: Piece[];
	board: Board;
	gameOver: boolean;
	score: number;
}

export class Game {
	public player: Player;
	public pieces: Piece[] = [];
	public nbOfpieceDown: number = 0;
	public newPieceNeeded: boolean = false;
	public gameOver: boolean = false;
	public downInterval: NodeJS.Timeout | null = null;

	private board: Board;
	private score: number = 0;
	private levelSpeed: number;
	private currentPiece: Piece;

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
		if (this.board.gameOver) {
			this.gameOver = true;
			this.clearInterval();
			return;
		}
		if (this.downInterval === null && !this.gameOver) {
			this.downInterval = setInterval(() => {
				this.moveDown();
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
				this.spacePressed();
				break;
		}
	}

	public moveDown() {
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
			this.board.checkForLines();
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

	public spacePressed() {
		while (!this.newPieceNeeded) {
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

	public getDataToSend(): IGame {
		return {
			player: this.player,
			pieces: this.pieces,
			board: this.board,
			gameOver: this.gameOver,
			score: this.score,
		};
	}
}
