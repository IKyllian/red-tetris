import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hook';
import { IGame } from '../types/board.types';
import { isEqual } from 'lodash';
import { sendInputs, updatePlayerGame } from '../store/lobby.slice';
import { compareCells, getFramesPerGridCell } from '../utils/board.utils';
import { COMMANDS, isCommandType } from '../types/command.types';

export interface IInputsPacket {
	tick: number;
	inputs: COMMANDS[];
}
import { cloneDeep } from 'lodash';
import { handleInput, moveDown } from '../utils/handle-inputs.utils';
import seedrandom from 'seedrandom';
import {
	clearDropPreview,
	clearOldPosition,
	getNextPiece,
	getShape,
	setDropPreview,
	transferPieceToBoard,
} from '../utils/piece.utils';
import { IServerState } from '../store/tick.slice';
import { IPositionUpdate, UpdateType } from '../types/packet.types';

const MIN_TIME_BETWEEN_TICKS = 1000 / 30;
const BUFFER_SIZE = 1024;
const TICK_OFFSET = 4;

export const useTick = (game: IGame, gameOver: boolean, seed: string) => {
	// console.log('game over', gameOver);
	const requestRef = useRef<number>();
	const lastUpdateRef = useRef<number>();
	const tickRef = useRef<number>(0);
	const tickAdjustmentRef = useRef<number>(0);
	const adjustmentIterationRef = useRef<number>(0);
	const adjustmentIterationFromServerRef = useRef<number>(0);
	const timerRef = useRef<number>(0);
	const tickToMoveDownRef = useRef<number>(0);
	const dispatch = useAppDispatch();
	const isKeyUpRelease = useRef<boolean>(true);
	const isKeySpaceRelease = useRef<boolean>(true);

	const [fps, setFps] = useState(0);
	const fpsCounterRef = useRef(0);
	const lastFpsUpdateRef = useRef(performance.now());

	const gameRef = useRef<IGame>(cloneDeep(game));
	const rng = useRef<seedrandom.PRNG>(seedrandom(seed));

	const inputQueueRef = useRef<string[]>([]);
	const inputBufferRef = useRef<Array<string[]>>(
		new Array<string[]>(BUFFER_SIZE)
	);
	const stateBufferRef = useRef<Array<IGame>>(new Array<IGame>(BUFFER_SIZE));

	const lastServerStateRef = useRef<IServerState>(undefined);
	const lastServerStateProcessedRef = useRef<IServerState>(undefined);

	// Listen for tick adjustments from the store
	// const tickAdjustment = useAppSelector((state) => state.tick.tickAdjustment);
	// const adjustmentIteration = useAppSelector(
	// 	(state) => state.tick.adjustmentIteration
	// );
	const tickState = useAppSelector((state) => state.tick);

	const handleKeyDown = useCallback((event: KeyboardEvent) => {
		if (isCommandType(event.code)) {
			if (event.code === COMMANDS.KEY_UP) {
				if (!isKeyUpRelease.current) return;
				isKeyUpRelease.current = false;
			}
			if (event.code === COMMANDS.KEY_SPACE) {
				if (!isKeySpaceRelease.current) return;
				isKeySpaceRelease.current = false;
			}
			inputQueueRef.current.push(event.code);
		}
	}, []);

	const handleKeyRelease = useCallback((event: KeyboardEvent) => {
		const code = event.code;
		if (code === COMMANDS.KEY_UP) {
			isKeyUpRelease.current = true;
		}
		if (code === COMMANDS.KEY_SPACE) {
			isKeySpaceRelease.current = true;
		}
	}, []);

	const processInputs = () => {
		if (inputQueueRef.current.length === 0) return;
		inputQueueRef.current.forEach((key) => {
			handleInput(
				key as COMMANDS,
				gameRef.current,
				rng.current,
				tickToMoveDownRef
			);
		});
		dispatch(
			sendInputs({
				tick: tickRef.current,
				adjustmentIteration: adjustmentIterationRef.current,
				inputs: inputQueueRef.current,
			})
		);
		const index = tickRef.current % BUFFER_SIZE;
		inputBufferRef.current[index] = inputQueueRef.current;
		inputQueueRef.current = [];
	};

	const tickAdjustment = (serverTick: number) => {
		inputQueueRef.current = [];
		console.log(
			'Adjusting tick: ',
			tickRef.current,
			' by: ',
			serverTick + TICK_OFFSET - tickRef.current
		);
		while (tickRef.current < serverTick + TICK_OFFSET) {
			const index = tickRef.current % BUFFER_SIZE;
			if (
				tickToMoveDownRef.current >=
					getFramesPerGridCell(gameRef.current.level) &&
				gameRef.current.pieces[gameRef.current.currentPieceIndex]
			) {
				moveDown(
					gameRef.current,
					gameRef.current.pieces[gameRef.current.currentPieceIndex],
					rng.current,
					tickToMoveDownRef
				);
			} else {
				tickToMoveDownRef.current = tickToMoveDownRef.current + 1;
			}
			stateBufferRef.current[index] = cloneDeep(gameRef.current);
			tickRef.current = tickRef.current + 1;
		}
	};

	const handleServerReconciliation = () => {};

	const reprocessTicks = (state: IGame) => {
		tickToMoveDownRef.current =
			lastServerStateRef.current.tick % getFramesPerGridCell(state.level);
		let tickToProcess = lastServerStateRef.current.tick + 1;
		while (tickToProcess < tickRef.current) {
			const index = tickToProcess % BUFFER_SIZE;
			const inputs = inputBufferRef.current[index];
			if (inputs) {
				inputBufferRef.current[index].forEach((key) => {
					handleInput(
						key as COMMANDS,
						state,
						rng.current,
						tickToMoveDownRef
					);
				});
			}
			if (
				tickToMoveDownRef.current >=
					getFramesPerGridCell(state.level) &&
				state.pieces[state.currentPieceIndex]
			) {
				moveDown(
					state,
					state.pieces[state.currentPieceIndex],
					rng.current,
					tickToMoveDownRef
				);
			} else {
				tickToMoveDownRef.current = tickToMoveDownRef.current + 1;
			}
			stateBufferRef.current[index] = cloneDeep(state);
			tickToProcess++;
		}
		gameRef.current = cloneDeep(state);
	};

	const handleServerUpdate = () => {
		if (
			lastServerStateProcessedRef.current !== lastServerStateRef.current
		) {
			// advance simulation to be in sync with server
			if (
				tickRef.current <
				lastServerStateRef.current.tick + TICK_OFFSET
			) {
				tickAdjustment(lastServerStateRef.current.tick);
			}

			const index = lastServerStateRef.current.tick % BUFFER_SIZE;
			// let state: IGame = cloneDeep(stateBufferRef.current[index]);
			let state: IGame = stateBufferRef.current[index];

			if (!state) return;

			if (
				lastServerStateRef.current.packet.updateType ===
				UpdateType.POSITION
			) {
				const serverState: IPositionUpdate = lastServerStateRef.current
					.packet.state as IPositionUpdate;
				const i = state.currentPieceIndex;
				if (
					state.pieces[i].position.x !=
						serverState.piece.position.x ||
					state.pieces[i].position.y !=
						serverState.piece.position.y ||
					state.pieces[i].rotationState !=
						serverState.piece.rotationState ||
					state.pieces[i].type != serverState.piece.type
				) {
					console.log(
						"server reconciliation - updating piece's position: client position: ",
						state.pieces[i].position,
						' - server position: ',
						serverState.piece.position
					);
					const shape = getShape(
						state.pieces[i].type,
						state.pieces[i].rotationState
					);
					clearOldPosition(state.pieces[i], shape, state.board);
					state.pieces[i].position = serverState.piece.position;
					state.pieces[i].rotationState =
						serverState.piece.rotationState;
					state.pieces[i].type = serverState.piece.type;
					const newShape = getShape(
						serverState.piece.type,
						serverState.piece.rotationState
					);
					state.board.cells = transferPieceToBoard(
						state.board,
						serverState.piece,
						newShape,
						false
					);
					reprocessTicks(state);
				}
			} else {
				// console.log('board reconcilation');
				const i = state.currentPieceIndex;
				const serverState = lastServerStateRef.current.packet
					.state as IGame;
				if (
					!compareCells(state.board.cells, serverState.board.cells) ||
					!isEqual(
						state.pieces[state.currentPieceIndex],
						serverState.pieces[0]
					) ||
					state.gameOver !== serverState.gameOver ||
					state.currentPieceIndex !== serverState.currentPieceIndex ||
					state.level !== serverState.level
				) {
					console.log('board reconcilation');
					console.log(
						'client state: ',
						state,
						' - server state: ',
						serverState
					);
					state.board = serverState.board;
					state.currentPieceIndex = serverState.currentPieceIndex;
					state.pieces[state.currentPieceIndex].position =
						serverState.pieces[0].position;
					state.pieces[state.currentPieceIndex].rotationState =
						serverState.pieces[0].rotationState;
					state.pieces[state.currentPieceIndex].type =
						serverState.pieces[0].type;
					state.level = serverState.level;
					reprocessTicks(state);
				}
			}
			lastServerStateProcessedRef.current = lastServerStateRef.current;
		}
	};

	//TODO server reconciliation, send tick to move down to client ?
	const update = (timeStamp: number) => {
		const deltaTime = timeStamp - lastUpdateRef.current!;
		lastUpdateRef.current = timeStamp;
		timerRef.current += deltaTime;

		clearDropPreview(
			gameRef.current.board,
			gameRef.current.pieces[gameRef.current.currentPieceIndex]
		);
		// handleServerUpdate();
		while (timerRef.current >= MIN_TIME_BETWEEN_TICKS) {
			const currentTetromino =
				gameRef.current.pieces[gameRef.current.currentPieceIndex];
			processInputs();
			if (
				tickToMoveDownRef.current >=
					getFramesPerGridCell(gameRef.current.level) &&
				currentTetromino
			) {
				moveDown(
					gameRef.current,
					currentTetromino,
					rng.current,
					tickToMoveDownRef
				);
			} else {
				tickToMoveDownRef.current = tickToMoveDownRef.current + 1;
			}
			const index = tickRef.current % BUFFER_SIZE;
			stateBufferRef.current[index] = cloneDeep(gameRef.current);
			timerRef.current -= MIN_TIME_BETWEEN_TICKS;
			tickRef.current = tickRef.current + 1;
			// const tickTime = performance.now() - timeStamp;
			// console.log('tick time: ', tickTime.toFixed(2) + 'ms');
			// game = gameRef.current;
			// dispatch(updatePlayerGame(cloneDeep(gameRef.current)));
		}
		setDropPreview(
			gameRef.current.board,
			gameRef.current.pieces[gameRef.current.currentPieceIndex]
		);
		dispatch(updatePlayerGame(cloneDeep(gameRef.current)));

		// Update FPS counter
		fpsCounterRef.current += 1;
		if (timeStamp - lastFpsUpdateRef.current >= 1000) {
			setFps(fpsCounterRef.current);
			fpsCounterRef.current = 0;
			lastFpsUpdateRef.current = timeStamp;
		}

		requestRef.current = requestAnimationFrame(update);
	};

	// useEffect(() => {
	// 	tickAdjustmentRef.current = tickAdjustment;
	// 	adjustmentIterationFromServerRef.current = adjustmentIteration;
	// }, [tickAdjustment, adjustmentIteration]);

	useEffect(() => {
		tickAdjustmentRef.current = tickState.tickAdjustment;
		adjustmentIterationFromServerRef.current =
			tickState.adjustmentIteration;
		lastServerStateRef.current = tickState.lastServerState;
	}, [tickState]);

	useEffect(() => {
		console.log('GAME OVER in useEffet', gameOver);
		if (!gameOver) {
			console.log('in useEffect, gameRef.current', gameRef.current);
			gameRef.current.pieces = [];
			for (let i = 0; i < 4; i++) {
				gameRef.current.pieces.push(getNextPiece(rng.current));
			}
			window.addEventListener('keydown', handleKeyDown);
			window.addEventListener('keyup', handleKeyRelease);
			lastUpdateRef.current = performance.now();
			requestRef.current = requestAnimationFrame(update);
		}

		return () => {
			cancelAnimationFrame(requestRef.current!);
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyRelease);
		};
	}, [handleKeyDown, handleKeyRelease, gameOver]);

	return {
		fps,
	};
};
