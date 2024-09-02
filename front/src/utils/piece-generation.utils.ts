import { IGameState } from 'front/store/game.slice';
import { PIECES_BUFFER_SIZE } from 'front/utils/game.utils';
import { getNextPiece } from 'front/utils/piece.utils';

export function generatePieces(
	state: IGameState,
	count: number,
	offset: number = 0
) {
	const i =
		(state.playerGame.currentPieceIndex + offset) % PIECES_BUFFER_SIZE;
	for (let j = 0; j < count; j++) {
		if (state.skipPieceGeneration > 0) {
			state.skipPieceGeneration--;
			continue;
		}
		state.pieces[i + j] = getNextPiece(state.rng);
	}
}
