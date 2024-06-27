import _ from 'lodash';
import {
	CellType,
	IPosition,
	I_SRS,
	JLTSZ_SRS,
} from 'front/types/tetrominoes.type';
import { NbOfLinesForNextLevel, Scoring } from 'front/types/board.types';
import {
	checkCollision,
	clearDropPreview,
	clearOldPosition,
	generatePieces,
	getPieceIndex,
	getPosDown,
	getPosLeft,
	getPosRight,
	getShape,
	setDropPreview,
	transferPieceToBoard,
} from './piece.utils';
import { checkForLines } from './board.utils';
import { IGameState } from '../store/game.slice';
import { Commands } from 'front/types/command.types';
import { current } from 'immer';
function handlePieceDown(state: IGameState, shape: number[][]): void {
	state.playerGame.board.cells = transferPieceToBoard(
		state.playerGame.board,
		state.playerGame.piece,
		shape,
		true
	);
	generatePieces(state, 1, 4);
	state.playerGame.currentPieceIndex++;
	state.playerGame.piece = {
		...state.pieces[getPieceIndex(state.playerGame.currentPieceIndex)],
	};
	const newShape = getShape(
		state.playerGame.piece.type,
		state.playerGame.piece.rotationState
	);
	const linesCleared = checkForLines(state.playerGame.board);
	console.log('lines cleared: ', linesCleared);

	setDropPreview(state.playerGame.board, newShape, state.playerGame.piece);
	if (linesCleared > 0) {
		state.playerGame.linesCleared += linesCleared;
		console.log('toto lines cleared: ', state.playerGame.linesCleared);
		if (state.playerGame.linesCleared >= NbOfLinesForNextLevel) {
			state.playerGame.linesCleared -= NbOfLinesForNextLevel; //TODO Not sure
			state.playerGame.level++;
			state.playerGame.linesCleared = 0;
			console.log(
				'level up at tick: ',
				state.tick,
				' - level: ',
				state.playerGame.level
			);
		}
		state.playerGame.score +=
			Scoring[linesCleared - 1] * (state.playerGame.level + 1);
		state.playerGame.totalLinesCleared += linesCleared;
	}
	// setDropPreview(game.board, state.playerGame.piece, newShape);
	// TODO client game over
	// if (
	// 	checkCollision(
	// 		state.playerGame.board,
	// 		state.playerGame.piece.position,
	// 		newShape
	// 	)
	// ) {
	// 	state.playerGame.gameOver = true;
	// }
	state.playerGame.board.cells = transferPieceToBoard(
		state.playerGame.board,
		state.playerGame.piece,
		newShape,
		false
	);
}

export function moveDown(state: IGameState, isSoftDrop: boolean = false): void {
	if (state.playerGame) {
		const newPosition = {
			...state.playerGame.piece.position,
			y: state.playerGame.piece.position.y + 1,
		};
		state.tickToMoveDown = 0;
	
		const shape = getShape(
			state.playerGame.piece.type,
			state.playerGame.piece.rotationState
		);
		clearOldPosition(state.playerGame.piece, shape, state.playerGame.board);
		if (checkCollision(state.playerGame.board, newPosition, shape)) {
			handlePieceDown(state, shape);
		} else {
			if (!isSoftDrop) {
				state.playerGame.score += 1;
			}
	
			// setDropPreview(state.playerGame.board, state.playerGame.piece, shape);
			state.playerGame.piece.position = newPosition;
			state.playerGame.board.cells = transferPieceToBoard(
				state.playerGame.board,
				state.playerGame.piece,
				shape,
				false
			);
		}
	}
}

export function hardDrop(state: IGameState): void {
	state.tickToMoveDown = 0;
	const shape = getShape(
		state.playerGame.piece.type,
		state.playerGame.piece.rotationState
	);
	clearOldPosition(state.playerGame.piece, shape, state.playerGame.board);
	let nextPos = getPosDown(state.playerGame.piece.position);
	while (!checkCollision(state.playerGame.board, nextPos, shape)) {
		state.playerGame.score += 2;
		state.playerGame.piece.position = nextPos;
		nextPos = getPosDown(nextPos);
	}
	handlePieceDown(state, shape);
}

export function changeStatePiecePosition(
	state: IGameState,
	cb: (position: IPosition) => IPosition
): void {
	// const tetromino = state.playerGame.piece;
	if (state.playerGame) {
		const board = state.playerGame.board;
		const newPos = cb(state.playerGame.piece.position);
		const shape = getShape(
			state.playerGame.piece.type,
			state.playerGame.piece.rotationState
		);
	
		if (!checkCollision(board, newPos, shape)) {
			clearDropPreview(board, shape, state.playerGame.piece);
			clearOldPosition(state.playerGame.piece, shape, board);
			state.playerGame.piece.position = newPos;
			setDropPreview(board, shape, state.playerGame.piece);
			board.cells = transferPieceToBoard(
				board,
				state.playerGame.piece,
				shape,
				false
			);
		}
	}
}

export function rotate(state: IGameState): void {
	// const piece = state.playerGame.piece;
	if (state.playerGame) {
		const board = state.playerGame.board;
		if (state.playerGame.piece.type === CellType.O) return;
		const currentShape = getShape(
			state.playerGame.piece.type,
			state.playerGame.piece.rotationState
		);
		const newRotation = (state.playerGame.piece.rotationState + 1) % 4;
		const newShape = getShape(state.playerGame.piece.type, newRotation);
		const srs = state.playerGame.piece.type === CellType.I ? I_SRS : JLTSZ_SRS;
		for (let position of srs[state.playerGame.piece.rotationState]) {
			const newPosition = {
				x: state.playerGame.piece.position.x + position.x,
				y: state.playerGame.piece.position.y + position.y,
			};
			if (!checkCollision(board, newPosition, newShape)) {
				clearDropPreview(board, currentShape, state.playerGame.piece);
				clearOldPosition(state.playerGame.piece, currentShape, board);
				state.playerGame.piece.position = newPosition;
				state.playerGame.piece.rotationState = newRotation;
				setDropPreview(board, newShape, state.playerGame.piece);
				board.cells = transferPieceToBoard(
					board,
					state.playerGame.piece,
					newShape,
					false
				);
				break;
			}
		}
	}
	
}

export function handleInput(input: Commands, state: IGameState): void {
	// console.log('GOOD STATE = ', current(state));
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
