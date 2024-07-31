import { useAppDispatch, useAppSelector } from "front/store/hook";
import { leaveLobby, sendStartGame } from "front/store/lobby.slice";
import "./lobby.css";
import { LuCrown } from "react-icons/lu";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ILobby } from "front/types/lobby.type";
import { resetGame } from "front/store/game.slice";

export default function Lobby() {
	const lobby: ILobby | null = useAppSelector((state) => state.lobby);
	const dispatch = useAppDispatch();
	const playerConnected = useAppSelector((state) => state.player);
	const lobbyOwner = lobby?.players.find((player) => player.isLeader)?.id === playerConnected.id;
	const navigate = useNavigate();
	
	useEffect(() => {
		if (!lobby) {
			navigate("/home");
		}
		if (lobby?.gameStarted) {
			navigate("/game");
		}
	}, [lobby]);

	const handleClick = () => {
		dispatch(sendStartGame({ playerName: playerConnected.name }));
	};

	const handleLeave = () => {
		dispatch(leaveLobby(lobby.id));
		dispatch(resetGame());
	};

	if (lobby) {
		return (
			<div className="lobby-container flex flex-col gap16">
				<h1 data-testid='page-title'>
					{lobby.name} <span className="lobby-id">(#{lobby.id})</span>
				</h1>
				<div className="flex flex-row">
					<div className="player-list-container flex flex-col gap16">
						<div className="flex flex-col gap16">
							<span className="player-list-title"> Joueurs </span>
							<div className="player-list flex flex-col gap8">
								{lobby?.players?.map((player, index) => (
									<div
										data-testid='player-item'
										className="player-list-item flex flex-row items-center content-between"
										key={index}
									>
										{player.name}
										{player.isLeader && <LuCrown />}
									</div>
								))}
							</div>
						</div>
						<div data-testid='buttons-container' className="flex flex-row gap8">
							{lobbyOwner && (
								<button
									data-testid='start-button'
									className="button"
									type="button"
									onClick={handleClick}
								>
									Lancer partie
								</button>
							)}
							<button
								data-testid='leave-button'
								className="button"
								type="button"
								onClick={handleLeave}
							>
								Quitter lobby
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
