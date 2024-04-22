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
		if (this.currentPiece?.isFixed) {
			this.currentPiece = this.pieces[1];
			this.nbOfpieceDown++;
			this.newPieceNeeded = true;
		}
		if (this.downInterval === null && !this.gameOver) {
			this.downInterval = setInterval(() => {
				if (!this.currentPiece.isFixed) {
					this.board.moveDown(this.currentPiece);
				}
			}, 1000);
		}
		if (!this.currentPiece.isFixed) {
			this.board.transferPieceToBoard({
				tetromino: this.currentPiece,
				isOccupied: false,
			});
		}
	}

	public clearInterval() {
		if (this.downInterval !== null) {
			clearInterval(this.downInterval);
			this.downInterval = null;
		}
	}

	public handleCommand(command: COMMANDS) {
		if (this.gameOver || this.currentPiece.isFixed) return;

		switch (command) {
			case COMMANDS.KEY_UP:
				this.board.rotate(this.currentPiece);
				break;
			case COMMANDS.KEY_LEFT:
				this.board.moveLeft(this.currentPiece);
				break;
			case COMMANDS.KEY_RIGHT:
				this.board.moveRight(this.currentPiece);
				break;
			case COMMANDS.KEY_DOWN:
				this.clearInterval();
				this.board.moveDown(this.currentPiece);
				break;
			default:
				this.board.spacePressed(this.currentPiece);
				break;
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
