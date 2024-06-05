import { useAppDispatch, useAppSelector } from "front/store/hook";
import { ILobby } from "front/types/lobby.type";
import { leaveLobby, sendStartGame } from "front/store/lobby.slice";
import { Game } from "front/components/game/game";
import { Leaderboard } from "front/components/leaderboard/leaderboard";
import './lobby.css'
import { LuCrown } from "react-icons/lu";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function Lobby() {
	const lobby: ILobby = useAppSelector((state) => state.lobby);
	const dispatch = useAppDispatch();
	const playerConnected = useAppSelector((state) => state.player);
	const lobbyOwner = lobby.players.find((player) => player.isLeader);
	const navigate = useNavigate();
	// console.log("lobbyOwner = ", lobbyOwner)
	// console.log("playerConnected = ", playerConnected)

	useEffect(() => {
		console.log();
		if (!lobby.id || lobby.id === '') {
			navigate('/home')
		}
	}, [lobby])
	const handleClick = () => {
		dispatch(sendStartGame(null));
		// navigate("/game");
	};

	const handleLeave = () => {
		dispatch(leaveLobby(lobby.id));
	};

	//TODO on start, server emit tick several times, client respond with tick to get in sync

	// console.log('LOBBY RE RENDER = ', lobby);

	if (!lobby.gameStarted) {
		return (
			<div className="lobby-container flex flex-col gap16">
				<h1> {lobby.name} <span className="lobby-id">(#{lobby.id})</span></h1>
				<div className="flex flex-row">
					<div className="player-list-container flex flex-col gap16">
						<div className="flex flex-col gap16">
							<span className="player-list-title"> Players </span>
							<div className="player-list flex flex-col gap8">
								{lobby.players.map((player, index) =>
									<div className="player-list-item flex flex-row items-center content-between" key={index}>
										{player.name}
										{player.isLeader && <LuCrown />}	
									</div>
								)}
							</div>
						</div>
						<div className="flex flex-row gap8">
							{lobbyOwner && lobbyOwner.id === playerConnected.id && (
								<button className="button" type="button" onClick={handleClick}>
									Start Game
								</button>
							)}
							<button className="button" type="button" onClick={handleLeave}>
								Leave lobby
							</button>
						</div>
					</div>
					{ lobby.leaderboard && <Leaderboard leaderboard={lobby.leaderboard} /> }
				</div>
			</div>
		);
	} else {
		return <Game />;
	}
}