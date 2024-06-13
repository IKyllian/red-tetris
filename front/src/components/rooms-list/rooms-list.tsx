import { useAppDispatch } from "front/store/hook";
import "./rooms-list.css";
import { FaUsers } from "react-icons/fa";
import { useEffect, useState } from "react";
import { ILobby } from "front/types/lobby.type";
import { IoMdRefresh } from "react-icons/io";

export default function RoomsList() {
	const [lobbies, setLobbies] = useState<ILobby[]>([]);
	const [refresh, setRefresh] = useState<boolean>(true);
	useEffect(() => {
		if (refresh) {
			fetch("http://localhost:3000/lobby", { method: "GET" })
				.then((response) => {
					if (!response.ok) {
						throw new Error(
							`HTTP error! Status: ${response.status}`
						);
					}
					return response.json();
				})
				.then((data) => setLobbies(data))
				.catch((error) => console.error(error))
				.finally(() => setRefresh(false));
		}
	}, [refresh]);
	// const dispatch = useAppDispatch();
	// const joinLobby = () => {
	//     dispatch(joinLobby({
	//         lobbyId: data.lobbyId,
	//         playerName: playerName
	//     }));
	//     // navigate('/lobby');
	// }
	return (
		<div className="page-wrapper flex flex-col content-center items-center">
			<h2>
				Lobby List
				<button
					onClick={() => setRefresh(true)}
					style={{ marginLeft: "10px" }}
				>
					<IoMdRefresh />
				</button>
			</h2>
			<div className="rooms-list-container flex flex-col gap8">
				{lobbies.length === 0 ? (
					<div className="no-lobbies-message">
						No lobbies available
					</div>
				) : (
					lobbies.map((lobby, index) => {
						const leaderName = lobby.players.find(
							(player) => player.isLeader
						)?.name; // TODO: do we keep leader?
						return (
							<div
								key={index}
								className="room-list-item flex flex-row content-between items-center"
							>
								<div className="flex flex-col">
									<span className="lobby-name">
										{lobby.name}
									</span>
									<span className="lobby-info">
										{lobby.gameStarted
											? "In game"
											: "In lobby"}
										{" - "}
										{leaderName}
									</span>
								</div>
								<div className="flex flex-row gap4 items-center">
									<span className="lobby-name">
										{lobby.players.length}
									</span>
									<FaUsers />
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}
