import { updatePlayerGame } from 'front/store/game.slice';

export const gameLoop = (fpsRef: React.MutableRefObject<number>, dispatch) => {
	let timer: number = 0;
	let gameFrame: number;

	let lastUpdateTime: number = performance.now();
	let lastFpsUpdate: number = performance.now();

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
		dispatch(updatePlayerGame(deltaTime));
		gameFrame = requestAnimationFrame(update);
	};
	requestAnimationFrame(update);

	return () => {
		console.log('cleanup');
		cancelAnimationFrame(gameFrame);
	};
};
