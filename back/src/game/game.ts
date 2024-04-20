import { IBoard, defaultBoardSize } from 'src/type/board.interface';
import { Board } from './board';
import { Player } from './player';
import { defaultCell } from 'src/type/cell.interface';
import { cloneDeep, set } from 'lodash';
import { IPosition, defaultPosition } from 'src/type/tetromino.interface';
import { Piece } from './piece';
import { COMMANDS } from 'src/type/command.types';

export class Game {
	public player: Player;
	public pieces: Piece[] = [];
	public nbOfpieceDown: number = 0;
	public newPieceNeeded: boolean = false;

	private board: Board;
	private score: number = 0;
	private levelSpeed: number;

	constructor(player: Player, pieces: Piece[]) {
		for (let i = 0; i < 4; ++i) {
			this.pieces.push(cloneDeep(pieces[i]));
		}
		this.board = new Board(defaultBoardSize);
		this.player = player;
	}

	public addPiece(piece: Piece) {
		this.pieces = this.pieces.slice(1);
		this.pieces.push(cloneDeep(piece));
		this.newPieceNeeded = false;
	}

	public updateState() {
		const currentPiece = this.pieces[0];
		// if (!currentPiece.isFixed) {
		// 	this.board.clearOldPosition(currentPiece);
		// }
		// this.board.moveDown(currentPiece);
		if (currentPiece.isFixed) {
			this.nbOfpieceDown++;
			this.newPieceNeeded = true;
		}
		// else {
		// 	this.board.transferPieceToBoard({
		// 		tetromino: currentPiece,
		// 		isOccupied: false,
		// 	});
		// }

		this.board.printBoard();
	}

	public handleCommand(command: COMMANDS) {
		const currentPiece = this.pieces[0];
		switch (command) {
			case COMMANDS.KEY_UP:
				this.board.rotate(currentPiece);
				break;
			case COMMANDS.KEY_LEFT:
				this.board.moveLeft(currentPiece);
				break;
			case COMMANDS.KEY_RIGHT:
				this.board.moveRight(currentPiece);
				break;
			case COMMANDS.KEY_DOWN:
				this.board.moveDown(currentPiece);
				break;
			default:
				this.board.spacePressed(currentPiece);
				break;
		}
	}
}
