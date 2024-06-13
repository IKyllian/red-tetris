import { useAppDispatch, useAppSelector } from "front/store/hook";
import { leaveLobby, sendStartGame } from "front/store/lobby.slice";
import './lobby.css'
import { LuCrown } from "react-icons/lu";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ILobby } from "front/types/lobby.type";

export default function Lobby() {
	const lobby: ILobby | null = useAppSelector((state) => state.lobby);
	const dispatch = useAppDispatch();
	const playerConnected = useAppSelector((state) => state.player);
	const lobbyOwner = lobby?.players?.find((player) => player.isLeader)?.id === playerConnected.id;
	const navigate = useNavigate();
	// console.log("lobbyOwner = ", lobbyOwner)
	// console.log("playerConnected = ", playerConnected)
	// useEffect(() => {
	// 	console.log();
	// 	// if (lobby?.gameStarted && !lobby.id || lobby.id === '') {
	// 	// 	navigate('/home')
	// 	// }

	// 	// return(() => {
	// 	// 	dispatch(leaveLobby(lobby.id));
	// 	// })
	// }, [lobby])
	useEffect(() => {
		if (!lobby) {
			navigate("/home");
		}
		if (lobby?.gameStarted) {
			navigate("/game");
		}
	}, [lobby])

	const handleClick = () => {
		dispatch(sendStartGame({playerName: playerConnected.name}));
	};

	const handleLeave = () => {
		dispatch(leaveLobby(lobby.id));
	};

	//TODO on start, server emit tick several times, client respond with tick to get in sync

	// console.log('LOBBY RE RENDER = ', lobby);

	if (lobby) {
		return (
			<div className="lobby-container flex flex-col gap16">
				<h1>
					{lobby.name} <span className="lobby-id">(#{lobby.id})</span>
				</h1>
				<div className="flex flex-row">
					<div className="player-list-container flex flex-col gap16">
						<div className="flex flex-col gap16">
							<span className="player-list-title"> Players </span>
							<div className="player-list flex flex-col gap8">
								{lobby.players.map((player, index) => (
									<div
										className="player-list-item flex flex-row items-center content-between"
										key={index}
									>
										{player.name}
										{player.isLeader && <LuCrown />}
									</div>
								))}
							</div>
						</div>
						<div className="flex flex-row gap8">
							{lobbyOwner && (
								<button className="button" type="button" onClick={handleClick}>
									Start Game
								</button>
							)}
							<button className="button" type="button" onClick={handleLeave}>
								Leave lobby
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
