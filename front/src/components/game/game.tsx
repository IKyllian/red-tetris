import { useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../../store/hook";
import { IGameState } from "../../store/game.slice";
import { Board, PiecePreview, BoardPreview } from "../board/board";
import { gameLoop } from "../../utils/gameLoop";
import { getPieceIndex } from "../../utils/piece.utils";

export function Game() {
	const gameStarted = useAppSelector((state) => state.game.gameStarted);
	const gameOver = useAppSelector(
		(state) => state.game.playerGame.board.gameOver
	);
	const opponentsGames = useAppSelector((state) => state.game.opponentsGames);
	const playerGame = useAppSelector((state) => state.game.playerGame);
	const pieces = useAppSelector((state) => state.game.pieces);
	const fpsRef = useRef<number>(0);
	const dispatch = useAppDispatch();

	useEffect(() => {
		//TODO handle game over better
		if (gameOver) {
			console.log("GAME OVER");
			return;
		}
		const cleanup = gameLoop(fpsRef, dispatch);
		return () => {
			cleanup();
		};
	}, [gameStarted, dispatch, gameOver]);

	// useEffect(gameLoop(fpsRef), [game.gameStarted]);

	if (!gameStarted) {
		return <div>Game not started</div>;
	}

	return (
		// console.log("rendering"),
		<div>
			<div style={{ fontSize: "25px", color: "red" }}>
				FPS: {fpsRef.current.toFixed(2)}
			</div>
			<div className="boards-container flex flex-row gap8">
				{playerGame && (
					<>
						<Board board={playerGame.board} game={playerGame} />
						<div className="flex flex-col gap4">
							{pieces
								.slice(
									getPieceIndex(
										playerGame.currentPieceIndex + 1
									),
									getPieceIndex(
										playerGame.currentPieceIndex + 4
									)
								)
								.map((piece, pieceIndex) => (
									<PiecePreview
										key={pieceIndex}
										tetromino={piece}
									/>
								))}
						</div>
					</>
				)}
				{opponentsGames.map((game, index) => (
					<BoardPreview
						key={index}
						board={game.board}
						playerName={game.player.name}
						isGameOver={game.gameOver}
					/>
				))}
			</div>
		</div>
	);
}
