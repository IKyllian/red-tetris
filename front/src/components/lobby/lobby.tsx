import { useAppDispatch, useAppSelector } from "../../store/hook";
import { ILobby } from "../../types/lobby.type";
import { leaveLobby, startGame } from "../../store/lobby.slice";
import { Game } from "../game/game";

export function Lobby() {
	const lobby: ILobby = useAppSelector((state) => state.lobby);
	const dispatch = useAppDispatch();
	const playerConnected = useAppSelector((state) => state.player);
	const lobbyOwner = lobby.players.find((player) => player.isLeader);
	// console.log("lobbyOwner = ", lobbyOwner)
	// console.log("playerConnected = ", playerConnected)
	const handleClick = () => {
		dispatch(startGame());
	};

	const handleLeave = () => {
		dispatch(leaveLobby(lobby.id));
	};

	// console.log('LOBBY RE RENDER = ', lobby);

	if (!lobby.gameStarted) {
		return (
			<div>
				<h2> {lobby.name} </h2>
				<h3> {lobby.id} </h3>
				<div>
					<p> Player List : </p>
					<ul>
						{lobby.players.map((player, index) => {
							return <li key={index}>{player.name}</li>;
						})}
					</ul>
				</div>
				<div>
					{lobbyOwner && lobbyOwner.id === playerConnected.id && (
						<button type="button" onClick={handleClick}>
							{" "}
							Start Game{" "}
						</button>
					)}
					<button type="button" onClick={handleLeave}>
						{" "}
						Leave lobby{" "}
					</button>
				</div>
			</div>
		);
	} else {
		return (
			<Game
				opponentsGames={lobby.opponentsGames}
				playerGame={lobby.playerGame}
				lobby={lobby}
			/>
		);
	}
}
