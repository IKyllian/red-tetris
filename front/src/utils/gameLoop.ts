import { COMMANDS, isCommandType } from '../types/command.types';
import { addInputToQueue, updatePlayerGame } from '../store/game.slice';

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

	const update = (currentTime: number) => {
		const deltaTime = currentTime - lastUpdateTime;
		timer += deltaTime;
		calculateFPS(currentTime);
		lastUpdateTime = currentTime;

		if (inputQueue.length > 0) {
			console.log('inputs: ', inputQueue.length);
		}
		dispatch(updatePlayerGame(deltaTime));
		// tick++;
		// if (tick === 10) {
		// 	console.log('tick = ', tick);
		// }
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
