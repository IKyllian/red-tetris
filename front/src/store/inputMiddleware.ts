import { Middleware } from '@reduxjs/toolkit';
import { sendInputs } from './game.slice';

const inputMiddleware: Middleware = (store) => (next) => (action) => {
	if ((action as any).type === 'game/updatePlayerGame') {
		const result = next(action); // Let the reducer update the state first

		const state = store.getState();
		if (state.game.pendingInputs) {
			console.log('sending inputs', state.game.pendingInputs);
			const { tick, adjustmentIteration, inputs } =
				state.game.pendingInputs;
			store.dispatch(sendInputs({ tick, adjustmentIteration, inputs }));
			// state.game.pendingInputs = null; // Clear pending inputs
		}

		return result;
	} else {
		return next(action);
	}
};

export default inputMiddleware;
