import "./game.css";
import { IPlayer } from "front/types/player.type";
import { GameMode } from "front/types/packet.types";
import { useNavigate } from "react-router-dom";
import { ILobby } from "front/types/lobby.type";
import { resetLobby, sendStartGame } from "front/store/lobby.slice";
import { useAppDispatch, useAppSelector } from "front/store/hook";
import { leaveGame } from "front/store/game.slice";
import GameRanking from "../game-ranking/game-ranking";

// const LEADERBOARD: IPlayer[] = [
//     {
//         id: 'qwe',
//         name: 'Test',
//         isLeader: false
//     },
//     {
//         id: 'qwe',
//         name: 'Test2',
//         isLeader: false
//     },
//     {
//         id: 'qwe',
//         name: 'Test3',
//         isLeader: false
//     }
// ]

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
	console.log("isSolo", isSolo);
	const leave = () => {
		//TODO check if this is needed
		if (isSolo) {
			navigate("/home");
			dispatch(resetLobby());
		} else {
			navigate("/lobby");
		}
	};
	return (
		<div className="game-modal-container flex flex-col content-evenly">
			{!isSolo && lobby.leaderboard && (
				<GameRanking leaderboard={lobby.leaderboard} />
			)}
			{isSolo && (
				<div className="flex flex-col items-center content-center">
					<span className="modal-title"> Votre Score </span>
					<span className="modal-score"> {playerGame.score} </span>
				</div>
			)}
			<div className="flex flex-row items-center content-center gap8">
				<button className="button" onClick={leave}>
					Retour au lobby
				</button>
				{lobbyOwner && (
					<button
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
					<span> En attente du leader pour relancer </span>
				)}
			</div>
		</div>
	);
}
