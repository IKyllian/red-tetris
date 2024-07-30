import { IBoard } from "front/types/board.types";
import { IPosition } from "front/types/tetrominoes.type";
import { getPosDown, checkCollision } from "front/utils/piece.utils";

export function getDropPosition(
	board: IBoard,
	position: IPosition,
	shape: number[][]
): IPosition {
	let newPos = { ...position };
	let nextPos = getPosDown(newPos);
	while (!checkCollision(board, nextPos, shape)) {
		newPos = nextPos;
		nextPos = getPosDown(newPos);
	}
	return newPos;
}
