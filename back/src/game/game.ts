import { IBoard, defaultBoardSize } from 'src/type/board.interface';
import { Board } from './board';
import { Player } from './player';
import { defaultCell } from 'src/type/cell.interface';

export class Game {
	private board: Board;
	private player: Player;
	private score: number = 0;
	// private level: number;
	// constructor() {
	// 	setInterval(() => {
	// 		console.log('Game tick');
	// 	}, 1000);
	// }

	constructor(player: Player) {
		this.board = new Board(defaultBoardSize);
		this.player = player;
	}
}
