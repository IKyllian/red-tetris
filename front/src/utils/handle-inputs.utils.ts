import _ from 'lodash';
import {
	getPosLeft,
	getPosRight,
} from './piece.utils';
import { IGameState } from '../store/game.slice';
import { Commands } from 'front/types/command.types';
import { rotate, moveDown, changeStatePiecePosition, hardDrop } from 'front/utils/piece-move.utils'

export function handleInput(input: Commands, state: IGameState): void {
	switch (input) {
		case Commands.ROTATE:
			rotate(state);
			break;
		case Commands.MOVE_DOWN:
			moveDown(state);
			break;
		case Commands.MOVE_LEFT:
			changeStatePiecePosition(state, getPosLeft);
			break;
		case Commands.MOVE_RIGHT:
			changeStatePiecePosition(state, getPosRight);
			break;
		case Commands.HARD_DROP:
			hardDrop(state);
			break;
		default:
			break;
	}
}
