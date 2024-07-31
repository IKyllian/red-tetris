import { updatePlayerGame } from 'front/store/game.slice';

export const gameLoop = (dispatch) => {
	let timer: number = 0;
	let gameFrame: number;

	let lastUpdateTime: number = performance.now();

	const update = (currentTime: number) => {
		const deltaTime = currentTime - lastUpdateTime;
		timer += deltaTime;
		lastUpdateTime = currentTime;
		dispatch(updatePlayerGame(deltaTime));
		gameFrame = requestAnimationFrame(update);
	};
	gameFrame = requestAnimationFrame(update);

	return () => {
		console.log('cleanup');
		cancelAnimationFrame(gameFrame);
	};
};
