import "./game.css";
import { GameMode } from "front/types/packet.types";
import { useNavigate } from "react-router-dom";
import { ILobby } from "front/types/lobby.type";
import { resetLobby, sendStartGame } from "front/store/lobby.slice";
import { useAppDispatch, useAppSelector } from "front/store/hook";
import GameRanking from "../game-ranking/game-ranking";

interface GameModeProps {
	gameMode: GameMode;
	lobby: ILobby;
}

export default function GameModal({ gameMode, lobby }: GameModeProps) {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const playerConnected = useAppSelector((state) => state.player);
	const playerGame = useAppSelector((state) => state.game.playerGame);
	const lobbyOwner =
		lobby && !lobby.id
			? true
			: lobby?.players.find((player) => player.isLeader)?.id ===
			  playerConnected.id;
	const isSolo = gameMode === GameMode.SOLO;
	const leave = () => {
		//TODO check if this is needed
		if (isSolo) {
			dispatch(resetLobby());
			navigate("/home");
		} else {
			navigate("/lobby");
		}
	};
	return (
		<div data-testid='game-modal-container' className="game-modal-container flex flex-col content-evenly">
			{!isSolo && lobby.leaderboard && (
				<GameRanking leaderboard={lobby.leaderboard} />
			)}
			{isSolo && (
				<div data-testid='solo-score' className="flex flex-col items-center content-center">
					<span className="modal-title"> Votre Score </span>
					<span className="modal-score"> {playerGame.score} </span>
				</div>
			)}
			<div data-testid='buttons-container' className="flex flex-row items-center content-center gap8">
				<button data-testid='leave-button' className="button" onClick={leave}>
					Retour au lobby
				</button>
				{lobbyOwner && (
					<button
						data-testid='play-again-button'
						className="button"
						onClick={() =>
							dispatch(
								sendStartGame({
									playerName: playerConnected.name,
								})
							)
						}
					>
						Rejouer
					</button>
				)}
				{!lobbyOwner && (
					<span data-testid='waiting-text'> En attente du leader pour relancer </span>
				)}
			</div>
		</div>
	);
}
