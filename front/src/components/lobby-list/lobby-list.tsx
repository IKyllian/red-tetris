import { useAppDispatch, useAppSelector } from "front/store/hook";
import "./lobby-list.css";
import { FaUsers } from "react-icons/fa";
import { useEffect, useState } from "react";
import { ILobby } from "front/types/lobby.type";
import { IoMdRefresh } from "react-icons/io";
import { joinLobby } from "front/store/lobby.slice";
import { useNavigate } from "react-router-dom";

export default function LobbyList() {
	const [lobbies, setLobbies] = useState<ILobby[]>([]);
	const [refresh, setRefresh] = useState<boolean>(true);
	const playerName = useAppSelector((state) => state.player.name);
	const lobby = useAppSelector((state) => state.lobby);
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
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

	useEffect(() => {
		if (lobby) {
			navigate("/lobby");
		}
	}, [lobby]);

	const handleJoinLobby = (lobbyId: string) => {
		dispatch(
			joinLobby({
				lobbyId,
				playerName,
			})
		);
	};

	return (
		<div className="page-wrapper flex flex-col content-center items-center gap16">
			<div className="flex flex-row items-center gap16">
				<h2>Lobby List</h2>
				<IoMdRefresh
					onClick={() => setRefresh(true)}
					style={{
						fontSize: "30px",
						cursor: "pointer",
						border: "1px solid white",
						borderRadius: "50%",
						padding: "5px",
					}}
				/>
			</div>
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
								onClick={() => handleJoinLobby(lobby.id)}
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
