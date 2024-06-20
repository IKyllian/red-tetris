import { useEffect, useMemo, useRef, useState } from "react";
import { useAppSelector, useAppDispatch } from "front/store/hook";
import Board from "front/components/board/board";
import { gameLoop } from "front/utils/gameLoop";
import { getPieceIndex } from "front/utils/piece.utils";
import { addInputToQueue, resetGame } from "front/store/game.slice";
import { getCommand, Commands } from "front/types/command.types";
import BoardPreview from "front/components/board/board-preview";
import { leaveLobby } from "front/store/lobby.slice";
import { useNavigate } from "react-router-dom";
import GameModal from "./game-modal";
import "./game.css";
import { ILobby } from "front/types/lobby.type";
import { get } from "lodash";

const Countdown = () => {
	const [count, setCount] = useState<number>(3);

	useEffect(() => {
		const interval = setInterval(() => {
			setCount((prev) => prev - 1);
		}, 900);

		if (count < -1) {
			clearInterval(interval);
		}
		return () => clearInterval(interval);
	}, [count]);
	return (
		<div className="countdown-container">
			<span> 555</span>
			{count > -1 && <span> {count > 0 ? count : "GO"} </span>}
		</div>
	);
};

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
	// const opponentsGames = useAppS elector((state) => state.game.opponentsGames);
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
	// const tick = useAppSelector((state) => state.game.tick);
	const fpsRef = useRef<number>(0);

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
	// Disable scrolling when the component mounts and enable it when it unmounts
	// useEffect(() => {
	// 	if (!lobby) navigate('/home')
	// 	document.body.style.overflow = "hidden";
	// 	return () => {
	// 		document.body.style.overflow = "auto";
	// 		if (lobby) {
	// 			dispatch(leaveLobby(lobby.id));
	// 		}
	// 	};
	// }, []);
	//TODO: stop using useEffect

	// useEffect(() => {
	// 	return (() => {
	// 		if (lobby) {
	// 			dispatch(leaveLobby(lobby.id));
	// 		}
	// 	})
	// }, [])

	// useEffect(() => {
	// 	return () => {
	// 		dispatch(resetGame())
	// 	};
	// }, [])

	useEffect(() => {
		if (!lobby) navigate("/home");
		if (gameOver) {
			console.log("GAME OVER");
			return;
		}
		let cleanup;
		if (lobby) {
			cleanup = gameLoop(fpsRef, dispatch);
		}
		return () => {
			if (cleanup) cleanup();
		};
	}, [gameStarted, dispatch, gameOver, lobby]);

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
	console.log("opponents = ", opponentsGames);
	if (lobby) {
		return (
			<div className="game-container">
				{!lobby.gameStarted && (
					<GameModal lobby={lobby} gameMode={gameMode} />
				)}
				{/* <div style={{ fontSize: "25px", color: "green" }}>Tick: {tick}</div> */}

				{/* <div style={{ fontSize: "25px", color: "blue" }}>
					Render average: {renderAverage.current}
				</div> */}
				<div
					// className="game-wrapper flex flex-row items-center content-center gap8"
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
					{/* <div style={{ fontSize: "25px", color: "red" }}>
						FPS: {fpsRef.current.toFixed(2)}
					</div> */}
					{/* <Countdown /> */}
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
