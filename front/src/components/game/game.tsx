import { useEffect, useMemo, useRef, useState } from "react";
import { useAppSelector, useAppDispatch } from "../../store/hook";
import { Board, PiecePreview, BoardPreview } from "../board/board";
import { gameLoop } from "../../utils/gameLoop";
import { getPieceIndex } from "../../utils/piece.utils";

export function Game() {
	const gameStarted = useAppSelector((state) => state.game.gameStarted);
	const gameOver = useAppSelector((state) => state.game.playerGame?.gameOver);
	const opponentsGames = useAppSelector((state) => state.game.opponentsGames);
	const playerGameBoard = useAppSelector(
		(state) => state.game.playerGame?.board
	);
	const playerGamePieceIndex = useAppSelector(
		(state) => state.game.playerGame?.currentPieceIndex
	);
	const playerName = useAppSelector(
		(state) => state.game.playerGame?.player.name
	);
	const pieces = useAppSelector((state) => state.game.pieces);
	const fpsRef = useRef<number>(0);
	const dispatch = useAppDispatch();

	const lastRenderTimeRef = useRef(null);
	const renderCountRef = useRef<number>(0);
	const renderArrayRef = useRef<number[]>([]);
	const renderAverage = useRef<number>(0);

	const now = performance.now();
	if (!lastRenderTimeRef.current) {
		lastRenderTimeRef.current = now;
	}
	const elapsed = now - lastRenderTimeRef.current;
	if (elapsed >= 1000) {
		lastRenderTimeRef.current = now;
		renderArrayRef.current.push(renderCountRef.current);
		const sum = renderArrayRef.current.reduce((a, b) => a + b, 0);
		renderAverage.current = sum / renderArrayRef.current.length;
		renderCountRef.current = 0;
	} else {
		renderCountRef.current++;
	}

	useEffect(() => {
		if (gameOver) {
			console.log("GAME OVER");
			return;
		}
		const cleanup = gameLoop(fpsRef, dispatch);
		return () => {
			cleanup();
		};
	}, [gameStarted, dispatch, gameOver]);

	const opponentsGame = useMemo(() => opponentsGames, [opponentsGames]);

	// console.log("rendering");
	if (!gameStarted) {
		return <div>Game not started</div>;
	}

	return (
		<div>
			<div style={{ fontSize: "25px", color: "red" }}>
				FPS: {fpsRef.current.toFixed(2)}
			</div>
			<div style={{ fontSize: "25px", color: "blue" }}>
				Render average: {renderAverage.current}
			</div>
			<div className="boards-container flex flex-row gap8">
				{playerGameBoard && (
					<>
						<Board
							board={playerGameBoard}
							playerName={playerName}
							isGameOver={gameOver}
						/>
						<div className="flex flex-col gap4">
							{pieces
								.slice(
									getPieceIndex(playerGamePieceIndex + 1),
									getPieceIndex(playerGamePieceIndex + 4)
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
				{opponentsGame.map((game, index) => (
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
