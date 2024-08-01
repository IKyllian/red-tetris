import { useEffect, useRef, useState } from "react";
import { useAppSelector, useAppDispatch } from "front/store/hook";
import Board from "front/components/board/board";
import { gameLoop } from "front/utils/gameLoop";
import { getPieceIndex } from "front/utils/piece.utils";
import { addInputToQueue } from "front/store/game.slice";
import { getCommand, Commands } from "front/types/command.types";
import { useNavigate } from "react-router-dom";
import GameModal from "./game-modal";
import "./game.css";
import { ILobby } from "front/types/lobby.type";
import { GameMode } from "front/types/packet.types";

export default function Game() {
	const [isKeyUpReleased, setIsKeyUpReleased] = useState(true);
	const [isKeySpaceReleased, setIsKeySpaceReleased] = useState(true);
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const lobby: ILobby | null = useAppSelector((state) => state.lobby);
	const gameStarted = useAppSelector((state) => state.game.gameStarted);
	const gameOver = useAppSelector((state) => state.game.playerGame?.gameOver);
	const opponentsGames = useAppSelector(
		(state) => state.game.opponentsGames
	)?.filter((game) => !game.gameOver);
	const gameMode = useAppSelector((state) => state.game.gameMode);
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

	// const lastRenderTimeRef = useRef(null);
	// const renderCountRef = useRef<number>(0);
	// const renderArrayRef = useRef<number[]>([]);
	// const renderAverage = useRef<number>(0);

	// const now = performance.now();
	// if (!lastRenderTimeRef.current) {
	// 	lastRenderTimeRef.current = now;
	// }
	// const elapsed = now - lastRenderTimeRef.current;
	// if (elapsed >= 1000) {
	// 	lastRenderTimeRef.current = now;
	// 	renderArrayRef.current.push(renderCountRef.current);
	// 	const sum = renderArrayRef.current.reduce((a, b) => a + b, 0);
	// 	renderAverage.current = sum / renderArrayRef.current.length;
	// 	renderCountRef.current = 0;
	// } else {
	// 	renderCountRef.current++;
	// }

	useEffect(() => {
		if (!lobby) navigate("/home");
	}, [lobby]);

	useEffect(() => {
		if (gameOver) {
			console.log("GAME OVER");
			return;
		}
		let cleanup = gameLoop(dispatch);
		return () => {
			if (cleanup) cleanup();
		};
	}, [gameStarted, dispatch, gameOver]);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		const command: Commands | null = getCommand(event.code);
		if (command !== null) {
			if (command === Commands.ROTATE) {
				if (!isKeyUpReleased) return;
				setIsKeyUpReleased(false);
			} else if (command === Commands.HARD_DROP) {
				if (!isKeySpaceReleased) return;
				setIsKeySpaceReleased(false);
			}
			dispatch(addInputToQueue(command));
		}
	};

	const handleKeyRelease = (event: React.KeyboardEvent<HTMLDivElement>) => {
		const command: Commands | null = getCommand(event.code);
		if (command !== null) {
			if (command === Commands.ROTATE) {
				setIsKeyUpReleased(true);
			} else if (command === Commands.HARD_DROP) {
				setIsKeySpaceReleased(true);
			}
		}
	};

	if (!gameStarted) {
		return <div>Game not started</div>;
	}

	const flexClass = "flex flex-row content-evenly items-center gap8";
	if (lobby) {
		return (
			<div className="game-container">
				{((gameMode === GameMode.BATTLEROYAL && !lobby.gameStarted) ||
					(gameMode === GameMode.SOLO && gameOver)) && (
					<GameModal lobby={lobby} gameMode={gameMode} />
				)}
				<div
					className={`game-wrapper ${
						opponentsGames.length <= 1 ? flexClass : ""
					}`}
					tabIndex={0}
					onKeyDown={handleKeyDown}
					onKeyUp={handleKeyRelease}
					style={{
						outline: "none",
						position: "relative",
						marginLeft:
							opponentsGames.length <= 1
								? "0"
								: "calc(100vw / 4)",
					}}
				>
					<div
						className={`${
							opponentsGames.length > 1
								? "game-player-container"
								: ""
						}`}
						style={{
							left: opponentsGames.length > 0 ? "40%" : "50%",
						}}
					>
						{playerGameBoard && (
							<>
								<Board
									board={playerGameBoard}
									playerName={playerName}
									isGameOver={gameOver}
									nextPieces={pieces.slice(
										getPieceIndex(playerGamePieceIndex + 1),
										getPieceIndex(playerGamePieceIndex + 4)
									)}
									isOpponentBoards={false}
									gameMode={gameMode}
								/>
							</>
						)}
					</div>
					{opponentsGames.length > 0 && (
						<div
							// className="opponents-game-container flex flex-row gap16 flex-wrap"
							className={`${
								opponentsGames.length > 1
									? "opponents-game-container flex flex-row gap16 flex-wrap"
									: ""
							}`}
						>
							{opponentsGames.map((game, index) => {
								if (game) {
									return (
										<Board
											key={index}
											board={game.board}
											playerName={game.player.name}
											isGameOver={game.gameOver}
											nextPieces={
												game.currentPieceIndex
													? pieces.slice(
															getPieceIndex(
																game.currentPieceIndex +
																	1
															),
															getPieceIndex(
																game.currentPieceIndex +
																	4
															)
													  )
													: []
											}
											isOpponentBoards={true}
											opponentsLength={
												opponentsGames.length
											}
											gameMode={gameMode}
										/>
									);
								}
							})}
						</div>
					)}
				</div>
			</div>
		);
	}
}
