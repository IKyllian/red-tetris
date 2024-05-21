import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '../store/hook';
import { IGame } from '../types/board.types';
import {
	commandPressed,
	moveStateDown,
	sendInputs,
} from '../store/lobby.slice';
import { getFramesPerGridCell } from '../utils/board.utils';
import { COMMANDS, isCommandType } from '../types/command.types';

export interface IInputsPacket {
	tick: number;
	inputs: COMMANDS[];
}
const MIN_TIME_BETWEEN_TICKS = 1000 / 30;

export const useTick = (game: IGame, gameOver: boolean) => {
	// console.log('game over', gameOver);
	const requestRef = useRef<number>();
	const lastUpdateRef = useRef<number>();
	const tickRef = useRef<number>(0);
	const timerRef = useRef<number>(0);
	const tickToMoveDownRef = useRef<number>(0);
	const dispatch = useAppDispatch();
	const currentPiece = game.pieces[0];
	const isKeyUpRelease = useRef<boolean>(true);
	const isKeySpaceRelease = useRef<boolean>(true);

	const [fps, setFps] = useState(0);
	const fpsCounterRef = useRef(0);
	const lastFpsUpdateRef = useRef(performance.now());

	const inputQueueRef = useRef<string[]>([]);

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
			dispatch(commandPressed({ command: key as COMMANDS }));
		});
		dispatch(
			sendInputs({ tick: tickRef.current, inputs: inputQueueRef.current })
		);
		inputQueueRef.current = [];
	};

	const update = (timeStamp: number) => {
		const deltaTime = timeStamp - lastUpdateRef.current!;
		lastUpdateRef.current = timeStamp;
		timerRef.current += deltaTime;

		processInputs();
		while (timerRef.current >= MIN_TIME_BETWEEN_TICKS) {
			if (
				tickToMoveDownRef.current >= getFramesPerGridCell(game.level) &&
				currentPiece
			) {
				dispatch(moveStateDown());
				tickToMoveDownRef.current = 0;
			} else {
				tickToMoveDownRef.current = tickToMoveDownRef.current + 1;
			}
			timerRef.current -= MIN_TIME_BETWEEN_TICKS;
			tickRef.current = tickRef.current + 1;
		}

		// Update FPS counter
		fpsCounterRef.current += 1;
		if (timeStamp - lastFpsUpdateRef.current >= 1000) {
			setFps(fpsCounterRef.current);
			fpsCounterRef.current = 0;
			lastFpsUpdateRef.current = timeStamp;
		}

		requestRef.current = requestAnimationFrame(update);
	};

	useEffect(() => {
		console.log('GAME OVER in useEffect', gameOver);
		if (!gameOver) {
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
