import { useCallback, useEffect } from 'react';
import { COMMANDS, isCommandType } from '../types/command.types';
import { useDispatch } from 'react-redux';
import { addInputToQueue, updatePlayerGame } from '../store/game.slice';
import { useAppDispatch } from '../store/hook';
import { cloneDeep } from 'lodash';

const MIN_TIME_BETWEEN_TICKS = 1000 / 30;
const BUFFER_SIZE = 1024;
const TICK_OFFSET = 4;

export const gameLoop = (fpsRef: React.MutableRefObject<number>, dispatch) => {
	// const dispatch = useAppDispatch();
	let tick: number = 0;
	let timer: number = 0;
	let gameFrame: number;

	let lastUpdateTime: number = performance.now();
	let lastFpsUpdate: number = performance.now();

	let isKeyUpReleased: boolean = true;
	let isKeySpaceReleased: boolean = true;

	let inputQueue: COMMANDS[] = [];

	let fps = 0;
	let frameCount = 0;

	const calculateFPS = (currentTime: number) => {
		const deltaTime = currentTime - lastFpsUpdate;
		frameCount++;
		if (deltaTime > 1000) {
			fpsRef.current = frameCount / (deltaTime / 1000);
			frameCount = 0;
			lastFpsUpdate = currentTime;
		}
	};

	// const processInputs = () => {
	// 	if (inputQueue.length === 0) return;
	// 	inputQueue.forEach((key) => {
	// 		handleInput(
	// 			key as COMMANDS,
	// 			gameRef,
	// 			rng,
	// 			tickToMoveDownRef
	// 		);
	// 	});
	// 	dispatch(
	// 		sendInputs({
	// 			tick: tickRef,
	// 			adjustmentIteration: adjustmentIterationRef,
	// 			inputs: inputQueue,
	// 		})
	// 	);
	// 	const index = tickRef % BUFFER_SIZE;
	// 	inputBufferRef[index] = inputQueue;
	// 	inputQueue = [];
	// };

	const update = (currentTime: number) => {
		const deltaTime = currentTime - lastUpdateTime;
		timer += deltaTime;
		calculateFPS(currentTime);
		lastUpdateTime = currentTime;

		if (inputQueue.length > 0) {
			console.log('inputs: ', inputQueue.length);
		}
		// const inputs = { ...inputQueue };
		// const inputsQueue = cloneDeep(inputQueue);
		// dispatch(updatePlayerGame({ deltaTime, inputQueue }));
		dispatch(updatePlayerGame(deltaTime));
		// inputQueue = [];

		// while (timer >= MIN_TIME_BETWEEN_TICKS) {
		// 	inputQueue.forEach((element) => {
		// 		console.log('tick: ', tick, ' element = ', element);
		// 	});
		// 	timer -= MIN_TIME_BETWEEN_TICKS;
		tick++;
		if (tick === 10) {
			console.log('tick = ', tick);
		}
		// if (tick === 200) {
		// 	console.log('returning');
		// 	return;
		// }
		// }
		gameFrame = requestAnimationFrame(update);
	};

	/**
	 ** Handle key down event
	 **/

	const handleKeyDown = (event: KeyboardEvent) => {
		if (isCommandType(event.code)) {
			if (event.code === COMMANDS.KEY_UP) {
				if (!isKeyUpReleased) return;
				isKeyUpReleased = false;
			}
			if (event.code === COMMANDS.KEY_SPACE) {
				if (!isKeySpaceReleased) return;
				isKeySpaceReleased = false;
			}
			// inputQueue.push(event.code);
			dispatch(addInputToQueue(event.code as COMMANDS));
		}
	};

	const handleKeyRelease = (event: KeyboardEvent) => {
		const code = event.code;
		if (code === COMMANDS.KEY_UP) {
			isKeyUpReleased = true;
		}
		if (code === COMMANDS.KEY_SPACE) {
			isKeySpaceReleased = true;
		}
	};

	window.addEventListener('keydown', handleKeyDown);
	window.addEventListener('keyup', handleKeyRelease);
	requestAnimationFrame(update);

	return () => {
		console.log('cleanup');
		cancelAnimationFrame(gameFrame);
		window.removeEventListener('keydown', handleKeyDown);
		window.removeEventListener('keyup', handleKeyRelease);
	};
};
